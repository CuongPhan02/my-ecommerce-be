import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV_CONFIG } from '@/config/env';
import { AIChatInput } from './ai.validate';
import { BadRequestError } from '@/utils/errors';

export class AIService {
  private aiInstance: GoogleGenerativeAI;

  constructor() {
    this.aiInstance = new GoogleGenerativeAI(ENV_CONFIG.GEMINI_API_KEY);
  }

  async chat(data: AIChatInput): Promise<string> {
    const { message, history } = data;

    try {
      // Sử dụng model gemini-1.5-flash hoặc gemini-2.5-flash để tối ưu hóa tốc độ và độ phản hồi
      const model = this.aiInstance.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: `Bạn là trợ lý ảo hỗ trợ khách hàng chuyên nghiệp, tận tâm của Nude Shop (một cửa hàng thời trang trực tuyến).
Hãy tuân thủ các nguyên tắc sau:
1. Thân thiện, lịch sự, xưng hô lễ phép với khách hàng (dùng "dạ", "ạ", xưng "em" hoặc "Nude Shop", gọi khách hàng là "anh/chị").
2. Hướng dẫn khách hàng mua sắm, trả lời các thắc mắc về thời trang, cách phối đồ, gợi ý sản phẩm.
3. Nếu khách hỏi thông tin không liên quan đến thời trang, mua sắm hoặc cửa hàng, hãy khéo léo từ chối và hướng cuộc trò chuyện quay lại chủ đề thời trang của Nude Shop.
4. Trả lời ngắn gọn, rõ ràng, xuống dòng hợp lý để dễ đọc trên khung chat điện thoại/máy tính.`,
      });

      // Chuyển đổi định dạng lịch sử chat của Client sang định dạng của Gemini API
      const geminiHistory = (history || []).map((item) => ({
        role: item.role,
        parts: [{ text: item.message }],
      }));

      // Khởi tạo phiên chat có nhớ ngữ cảnh
      const chat = model.startChat({
        history: geminiHistory,
      });

      const result = await chat.sendMessage(message);
      const response = result.response.text();

      if (!response) {
        throw new Error('Không nhận được phản hồi từ AI');
      }

      return response;
    } catch (error: any) {
      console.error('❌ Lỗi tích hợp Gemini API:', error);
      throw new BadRequestError(`Có lỗi xảy ra khi trò chuyện với AI: ${error.message}`);
    }
  }
}
