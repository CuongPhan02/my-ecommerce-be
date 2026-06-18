import {
  GoogleGenerativeAI,
  FunctionDeclaration,
  Tool,
  SchemaType,
  Part,
} from '@google/generative-ai';
import { ENV_CONFIG } from '@/config/env';
import { AIChatInput } from './ai.validate';
import { BadRequestError } from '@/utils/errors';
import { ProductRepository } from '@/modules/product/product.repository';
import { VoucherRepository } from '@/modules/voucher/voucher.repository';
import { OrderRepository } from '@/modules/order/order.repository';

// ─── Structured response types for FE ───────────────────────────
export interface AIProductCard {
  id: string;
  name: string;
  slug: string;
  price: string;
  thumbnail: string | null;
}

export interface AIVoucherChip {
  code: string;
  discount: string;
  description: string;
  minOrder: string;
}

export interface AIChatResponse {
  text: string;
  products?: AIProductCard[];
  vouchers?: AIVoucherChip[];
}

// ─── Function declarations for Gemini Function Calling ──────────
const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'get_hot_products',
    description:
      'Lấy danh sách sản phẩm nổi bật, bán chạy hoặc mới nhất trên Nude Shop. Dùng khi khách hỏi về sản phẩm hot, trending, mới, nổi bật.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        limit: {
          type: SchemaType.INTEGER,
          description: 'Số lượng sản phẩm cần lấy (mặc định 5, tối đa 10)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_active_vouchers',
    description:
      'Lấy danh sách mã giảm giá/voucher đang còn hiệu lực. Dùng khi khách hỏi về mã giảm giá, coupon, khuyến mãi.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_order_status',
    description:
      'Tra cứu trạng thái đơn hàng của khách hàng theo mã đơn hàng. Dùng khi khách hỏi về tình trạng đơn hàng.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        orderId: {
          type: SchemaType.STRING,
          description: 'Mã đơn hàng (order ID hoặc ký tự đầu của mã đơn)',
        },
      },
      required: ['orderId'],
    },
  },
  {
    name: 'search_products_by_name',
    description:
      'Tìm kiếm sản phẩm theo từ khóa tên. Dùng khi khách hỏi về sản phẩm cụ thể hoặc muốn kiểm tra tồn kho.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        keyword: {
          type: SchemaType.STRING,
          description: 'Từ khóa tìm kiếm sản phẩm',
        },
      },
      required: ['keyword'],
    },
  },
];

const GEMINI_TOOLS: Tool[] = [{ functionDeclarations: TOOL_DECLARATIONS }];

// ─── Status map ───────────────────────────────────────────────
const ORDER_STATUS_MAP: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  PROCESSING: 'Đang xử lý',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao hàng',
  DELIVERED: 'Đã giao thành công',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Đã hoàn tiền',
  RETURN_REQUESTED: 'Đang yêu cầu hoàn hàng',
};

const PAYMENT_STATUS_MAP: Record<string, string> = {
  PENDING: 'Chờ thanh toán',
  COMPLETED: 'Đã thanh toán',
  FAILED: 'Thanh toán thất bại',
  REFUNDED: 'Đã hoàn tiền',
};

// ─── AI Service ───────────────────────────────────────────────
export class AIService {
  private aiInstance: GoogleGenerativeAI;
  private productRepo: ProductRepository;
  private voucherRepo: VoucherRepository;
  private orderRepo: OrderRepository;

  constructor(db: any) {
    this.aiInstance = new GoogleGenerativeAI(ENV_CONFIG.GEMINI_API_KEY);
    this.productRepo = new ProductRepository(db);
    this.voucherRepo = new VoucherRepository(db);
    this.orderRepo = new OrderRepository(db);
  }

  // ─── Execute tool calls from Gemini ─────────────────────────
  private async executeToolCall(
    name: string,
    args: Record<string, any>,
    userId?: string
  ): Promise<string> {
    try {
      switch (name) {
        case 'get_hot_products': {
          const limit = Math.min(args.limit || 5, 10);
          const { products } = await this.productRepo.getAllProducts({
            page: 1,
            limit,
            sort: 'newest',
          });

          if (!products || products.length === 0) {
            return JSON.stringify({ message: 'Không có sản phẩm nổi bật nào.' });
          }

          const result = products.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.variants?.[0]?.priceFormatted || 'Liên hệ',
            thumbnail: p.thumbnail?.url || null,
            stock: p.stock || 0,
            category: p.category?.name || '',
          }));

          return JSON.stringify({ products: result });
        }

        case 'get_active_vouchers': {
          const vouchers = await this.voucherRepo.getPublicVouchers();

          if (!vouchers || vouchers.length === 0) {
            return JSON.stringify({ message: 'Hiện tại không có mã giảm giá nào đang hoạt động.' });
          }

          const result = vouchers.map((v: any) => ({
            code: v.code,
            discount:
              v.type === 'FIXED'
                ? v.discountValueFormatted
                : `Giảm ${v.discountValue}%`,
            minOrder: v.minOrderValueFormatted || '0đ',
            expiresAt: v.expirationDate
              ? new Date(v.expirationDate).toLocaleDateString('vi-VN')
              : 'Không giới hạn',
            description: v.description || '',
          }));

          return JSON.stringify({ vouchers: result });
        }

        case 'get_order_status': {
          if (!userId) {
            return JSON.stringify({
              error: 'Khách hàng chưa đăng nhập. Vui lòng đăng nhập để tra cứu đơn hàng.',
            });
          }

          const orderId = args.orderId?.trim();
          if (!orderId) {
            return JSON.stringify({ error: 'Vui lòng cung cấp mã đơn hàng.' });
          }

          // Try exact match first
          const order = await this.orderRepo.getMyOrderById(orderId, userId);

          if (!order) {
            // Try to list recent orders if orderId might be partial
            const { orders } = await this.orderRepo.getOrdersByUserId(userId, 1, 5);
            if (!orders || orders.length === 0) {
              return JSON.stringify({ error: `Không tìm thấy đơn hàng #${orderId}. Vui lòng kiểm tra lại mã đơn.` });
            }
            const recentOrder = orders[0] as any;
            return JSON.stringify({
              message: `Không tìm thấy đơn #${orderId}. Đơn hàng gần nhất của bạn:`,
              order: {
                id: recentOrder.id,
                status: ORDER_STATUS_MAP[recentOrder.status] || recentOrder.status,
                totalAmount: recentOrder.totalAmountFormatted,
                paymentStatus: PAYMENT_STATUS_MAP[recentOrder.payment?.status] || recentOrder.payment?.status,
                createdAt: new Date(recentOrder.createdAt).toLocaleDateString('vi-VN'),
              },
            });
          }

          const orderData = order as any;
          return JSON.stringify({
            order: {
              id: orderData.id,
              status: ORDER_STATUS_MAP[orderData.status] || orderData.status,
              totalAmount: orderData.totalAmountFormatted,
              paymentStatus: PAYMENT_STATUS_MAP[orderData.payment?.status] || orderData.payment?.status,
              shippingMethod: orderData.shippingMethod,
              createdAt: new Date(orderData.createdAt).toLocaleDateString('vi-VN'),
              itemCount: orderData.items?.length || 0,
            },
          });
        }

        case 'search_products_by_name': {
          const keyword = args.keyword?.trim();
          if (!keyword) return JSON.stringify({ message: 'Vui lòng cung cấp từ khóa.' });

          const { products } = await this.productRepo.getAllProducts({
            page: 1,
            limit: 5,
            search: keyword,
          });

          if (!products || products.length === 0) {
            return JSON.stringify({ message: `Không tìm thấy sản phẩm nào với từ khóa "${keyword}".` });
          }

          const result = products.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.variants?.[0]?.priceFormatted || 'Liên hệ',
            thumbnail: p.thumbnail?.url || null,
            stock: p.stock || 0,
          }));

          return JSON.stringify({ products: result });
        }

        default:
          return JSON.stringify({ error: `Tool "${name}" không được nhận dạng.` });
      }
    } catch (err: any) {
      console.error(`❌ Tool "${name}" error:`, err?.message);
      return JSON.stringify({ error: `Lỗi khi thực hiện "${name}": ${err?.message}` });
    }
  }

  // ─── Main Chat Method ────────────────────────────────────────
  async chat(data: AIChatInput): Promise<AIChatResponse> {
    const { message, history, imageBase64, mimeType, userId } = data;

    try {
      const model = this.aiInstance.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: `Bạn là trợ lý ảo thời trang NUDE - đại diện của Nude Shop, một cửa hàng thời trang trực tuyến cao cấp.

Nguyên tắc giao tiếp:
1. Thân thiện, lịch sự, xưng "em", gọi khách là "anh/chị", dùng "dạ", "ạ".
2. Hướng dẫn mua sắm, tư vấn thời trang, phối đồ.
3. Nếu khách hỏi về sản phẩm, voucher, đơn hàng → LUÔN gọi tool tương ứng để lấy dữ liệu thực.
4. Sau khi nhận dữ liệu từ tool, format kết quả thân thiện bằng tiếng Việt.
5. Trả lời ngắn gọn, xuống dòng hợp lý, dễ đọc trên mobile.
6. Nếu khách tải ảnh → phân tích phong cách, màu sắc và gợi ý sản phẩm phù hợp từ shop (gọi tool search_products_by_name).
7. Chủ đề không liên quan thời trang/mua sắm → khéo léo từ chối và hướng về thời trang.

URL sản phẩm: https://nude-shop.com/shop/[slug]
URL đơn hàng: https://nude-shop.com/profile/orders`,
      });

      // Gemini requires: history must start with 'user' role and alternate user/model.
      // Filter out leading 'model' messages (e.g. the welcome message) before passing to API.
      const rawHistory = history || [];
      let startIndex = 0;
      while (startIndex < rawHistory.length && rawHistory[startIndex]!.role !== 'user') {
        startIndex++;
      }
      const validHistory = rawHistory.slice(startIndex);

      // Build paired history: Gemini needs strict user→model→user→model alternation.
      // Collapse consecutive same-role messages and ensure proper pairing.
      const pairedHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
      for (const item of validHistory) {
        const last = pairedHistory[pairedHistory.length - 1];
        if (last && last.role === item.role) {
          // Merge consecutive same-role messages
          last.parts[0]!.text += '\n' + item.message;
        } else {
          pairedHistory.push({ role: item.role, parts: [{ text: item.message }] });
        }
      }

      // Ensure the history ends with 'model' (not 'user'), so the next message is from 'user'
      if (pairedHistory.length > 0 && pairedHistory[pairedHistory.length - 1]!.role === 'user') {
        pairedHistory.pop();
      }

      const geminiHistory = pairedHistory;

      const chat = model.startChat({
        history: geminiHistory,
        tools: GEMINI_TOOLS,
      });

      // Build message parts (text + optional image)
      const messageParts: Part[] = [];

      if (imageBase64 && mimeType) {
        messageParts.push({
          inlineData: {
            data: imageBase64,
            mimeType: mimeType,
          },
        });
        messageParts.push({
          text: message || 'Hãy phân tích trang phục trong ảnh và gợi ý sản phẩm tương tự trên Nude Shop.',
        });
      } else {
        messageParts.push({ text: message });
      }

      // ─── Agentic Loop ────────────────────────────────────────
      let result = await chat.sendMessage(messageParts);

      // Max 5 iterations to prevent infinite loop
      for (let iter = 0; iter < 5; iter++) {
        const response = result.response;
        const candidate = response.candidates?.[0];

        if (!candidate) break;

        // Check for function calls
        const functionCalls = candidate.content?.parts?.filter(
          (p: any) => p.functionCall
        );

        if (!functionCalls || functionCalls.length === 0) break;

        // Execute all function calls
        const functionResponses: Part[] = [];

        for (const part of functionCalls) {
          const { name, args } = part.functionCall!;
          console.log(`🤖 AI calling tool: ${name}`, args);

          const toolResult = await this.executeToolCall(name, args as Record<string, any>, userId);
          console.log(`✅ Tool result for ${name}:`, toolResult.substring(0, 200));

          functionResponses.push({
            functionResponse: {
              name,
              response: { result: toolResult },
            },
          });
        }

        // Send tool results back to model
        result = await chat.sendMessage(functionResponses);
      }

      // ─── Extract final text response ─────────────────────────
      const finalText = result.response.text();

      if (!finalText) {
        throw new Error('Không nhận được phản hồi từ AI');
      }

      // ─── Parse structured data from tool calls for FE ────────
      const aiResponse: AIChatResponse = { text: finalText };

      // Extract product/voucher data from the last tool executions to pass to FE
      const allParts = result.response.candidates?.[0]?.content?.parts || [];
      for (const part of (history || [])) { void part; } // type guard

      // Re-collect products/vouchers from the conversation context
      const { products: extractedProducts, vouchers: extractedVouchers } =
        await this.extractStructuredData(message, userId);

      if (extractedProducts && extractedProducts.length > 0) {
        aiResponse.products = extractedProducts;
      }
      if (extractedVouchers && extractedVouchers.length > 0) {
        aiResponse.vouchers = extractedVouchers;
      }

      return aiResponse;
    } catch (error: any) {
      console.error('❌ Lỗi tích hợp Gemini API:', error);

      // Friendly error messages for common cases
      const errMsg: string = error?.message || '';
      if (errMsg.includes('429') || errMsg.includes('Too Many Requests') || errMsg.includes('quota')) {
        throw new BadRequestError(
          'Hệ thống AI đang quá tải, vui lòng thử lại sau vài giây nhé ạ!'
        );
      }
      if (errMsg.includes('SAFETY') || errMsg.includes('blocked')) {
        throw new BadRequestError(
          'Nội dung không phù hợp. Anh/chị vui lòng đặt câu hỏi khác nhé!'
        );
      }
      throw new BadRequestError('Có lỗi xảy ra khi kết nối AI. Vui lòng thử lại sau.');
    }
  }

  // ─── Extract structured data based on message intent ────────
  private async extractStructuredData(
    message: string,
    userId?: string
  ): Promise<{ products?: AIProductCard[]; vouchers?: AIVoucherChip[] }> {
    const msg = message.toLowerCase();
    const result: { products?: AIProductCard[]; vouchers?: AIVoucherChip[] } = {};

    const isProductQuery =
      msg.includes('sản phẩm') ||
      msg.includes('hàng') ||
      msg.includes('mua') ||
      msg.includes('hot') ||
      msg.includes('bán chạy') ||
      msg.includes('mới nhất') ||
      msg.includes('nổi bật') ||
      msg.includes('áo') ||
      msg.includes('quần') ||
      msg.includes('váy') ||
      msg.includes('trang phục');

    const isVoucherQuery =
      msg.includes('voucher') ||
      msg.includes('giảm giá') ||
      msg.includes('coupon') ||
      msg.includes('mã') ||
      msg.includes('khuyến mãi') ||
      msg.includes('ưu đãi');

    if (isProductQuery) {
      try {
        const { products } = await this.productRepo.getAllProducts({
          page: 1,
          limit: 5,
          sort: 'newest',
        });
        result.products = (products || [])
          .filter((p: any) => p)
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.variants?.[0]?.priceFormatted || 'Liên hệ',
            thumbnail: p.thumbnail?.url || null,
          }));
      } catch { /* skip */ }
    }

    if (isVoucherQuery) {
      try {
        const vouchers = await this.voucherRepo.getPublicVouchers();
        result.vouchers = (vouchers || [])
          .filter((v: any) => v)
          .map((v: any) => ({
            code: v.code,
            discount:
              v.type === 'FIXED'
                ? v.discountValueFormatted
                : `Giảm ${v.discountValue}%`,
            minOrder: v.minOrderValueFormatted || '0đ',
            description: v.description || '',
          }));
      } catch { /* skip */ }
    }

    return result;
  }
}
