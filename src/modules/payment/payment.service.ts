import crypto from 'crypto';
import { ENV_CONFIG } from '@/config/env';
import { NotFoundError, BadRequestError } from '@/utils/errors';
import { PaymentRepository } from './payment.repository';
import { CreatePaymentUrlInput } from './payment.validate';
import { OrderRepository } from '@/modules/order/order.repository';
import { BrevoProvider } from '@/provider/brevo-provider';

export class PaymentService {
  private repo: PaymentRepository;
  private orderRepo: OrderRepository;

  constructor(repo: PaymentRepository, orderRepo: OrderRepository) {
    this.repo = repo;
    this.orderRepo = orderRepo;
  }

  /**
   * Tạo URL thanh toán VNPAY
   */
  async createPaymentUrl(data: CreatePaymentUrlInput, ipAddress: string): Promise<string> {
    const order = await this.repo.findOrderById(data.orderId);
    if (!order) {
      throw new NotFoundError('Không tìm thấy đơn hàng');
    }

    // Đảm bảo có bản ghi thanh toán tương ứng
    const existingPayment = await this.repo.findPaymentByOrderId(order.id);
    if (!existingPayment) {
      await this.repo.createPayment({
        amount: order.totalAmount,
        method: 'VNPAY',
        orderId: order.id,
        status: 'PENDING',
      });
    }

    // Chuẩn bị tham số cho VNPAY
    const date = new Date();
    const formatDate = (d: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return (
        d.getFullYear() +
        pad(d.getMonth() + 1) +
        pad(d.getDate()) +
        pad(d.getHours()) +
        pad(d.getMinutes()) +
        pad(d.getSeconds())
      );
    };

    const createDate = formatDate(date);
    const amount = Math.round(order.totalAmount * 100); // Nhân 100 theo yêu cầu VNPAY

    // Chuẩn hóa địa chỉ IP (chỉ chấp nhận IPv4)
    let cleanIp = ipAddress || '127.0.0.1';
    if (cleanIp === '::1' || cleanIp === '::') {
      cleanIp = '127.0.0.1';
    } else if (cleanIp.startsWith('::ffff:')) {
      cleanIp = cleanIp.substring(7);
    }

    const vnpParams: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: ENV_CONFIG.VNP_TMN_CODE,
      vnp_Locale: data.language || 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: order.id,
      vnp_OrderInfo: `Thanh toan don hang ${order.id}`,
      vnp_OrderType: 'billpayment',
      vnp_Amount: amount.toString(),
      vnp_ReturnUrl: ENV_CONFIG.VNP_RETURN_URL,
      vnp_IpAddr: cleanIp,
      vnp_CreateDate: createDate,
    };

    if (data.bankCode) {
      vnpParams.vnp_BankCode = data.bankCode;
    }

    // Sắp xếp các tham số theo thứ tự abc và tạo dữ liệu ký hash
    const sortedKeys = Object.keys(vnpParams).sort();
    const signData = sortedKeys
      .map((key) => `${key}=${encodeURIComponent(vnpParams[key] ?? '').replace(/%20/g, '+')}`)
      .join('&');

    const hmac = crypto.createHmac('sha512', ENV_CONFIG.VNP_HASH_SECRET);
    const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const queryUrl = sortedKeys
      .map((key) => `${key}=${encodeURIComponent(vnpParams[key] ?? '').replace(/%20/g, '+')}`)
      .join('&') + `&vnp_SecureHash=${secureHash}`;

    return `${ENV_CONFIG.VNP_URL}?${queryUrl}`;
  }

  /**
   * Xử lý Return URL (Kiểm tra chữ ký và cập nhật trạng thái đơn hàng)
   */
  async handleReturn(query: Record<string, any>) {
    const secureHash = query.vnp_SecureHash;
    if (!secureHash) {
      throw new BadRequestError('Mã băm bảo mật không hợp lệ từ VNPAY');
    }

    const vnpParams = { ...query };
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    // Lọc bỏ tham số rỗng
    const cleanParams: Record<string, string> = {};
    for (const key of Object.keys(vnpParams)) {
      const val = vnpParams[key];
      if (val !== undefined && val !== null && val !== '') {
        cleanParams[key] = String(val);
      }
    }

    const sortedKeys = Object.keys(cleanParams).sort();
    const signData = sortedKeys
      .map((key) => `${key}=${encodeURIComponent(cleanParams[key] ?? '').replace(/%20/g, '+')}`)
      .join('&');

    const hmac = crypto.createHmac('sha512', ENV_CONFIG.VNP_HASH_SECRET);
    const calculatedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (calculatedHash !== secureHash) {
      throw new BadRequestError('Xác thực chữ ký không hợp lệ');
    }

    const orderId = query.vnp_TxnRef;
    const responseCode = query.vnp_ResponseCode;
    const transactionStatus = query.vnp_TransactionStatus;
    const vnpTransactionNo = query.vnp_TransactionNo;

    const isSuccess = responseCode === '00' && transactionStatus === '00';

    const order = await this.repo.findOrderById(orderId);
    if (order) {
      const payment = order.payment;
      if (payment && payment.status === 'PENDING') {
        if (isSuccess) {
          await this.repo.updatePaymentStatus(orderId, 'COMPLETED', vnpTransactionNo);
          await this.repo.updateOrderStatus(orderId, 'PROCESSING');

          // Gửi mail thanh toán thành công
          try {
            const fullOrder = await this.orderRepo.getOrderById(orderId);
            if (fullOrder && fullOrder.customer && fullOrder.customer.email) {
              await BrevoProvider.sendReactMail(
                fullOrder.customer.email,
                `Thanh toán thành công đơn hàng #${fullOrder.id}`,
                'PaymentSuccessEmail',
                { order: fullOrder }
              );
            }
          } catch (error) {
            console.error(`❌ Gửi email thanh toán thành công lỗi (Order #${orderId}):`, error);
          }
        } else {
          await this.repo.updatePaymentStatus(orderId, 'FAILED', vnpTransactionNo);
          await this.repo.updateOrderStatus(orderId, 'CANCELLED');

          // Gửi mail thanh toán thất bại
          try {
            const fullOrder = await this.orderRepo.getOrderById(orderId);
            if (fullOrder && fullOrder.customer && fullOrder.customer.email) {
              await BrevoProvider.sendReactMail(
                fullOrder.customer.email,
                `Thanh toán thất bại cho đơn hàng #${fullOrder.id}`,
                'PaymentFailedEmail',
                { order: fullOrder }
              );
            }
          } catch (error) {
            console.error(`❌ Gửi email thanh toán thất bại lỗi (Order #${orderId}):`, error);
          }
        }
      }
    }

    return {
      orderId,
      success: isSuccess,
      responseCode,
    };
  }

  /**
   * Xử lý IPN URL (Server-to-server callback cực kỳ quan trọng)
   */
  async handleIpn(query: Record<string, any>) {
    const secureHash = query.vnp_SecureHash;
    if (!secureHash) {
      return { RspCode: '97', Message: 'Chữ ký không hợp lệ' };
    }

    const vnpParams = { ...query };
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    // Lọc bỏ tham số rỗng
    const cleanParams: Record<string, string> = {};
    for (const key of Object.keys(vnpParams)) {
      const val = vnpParams[key];
      if (val !== undefined && val !== null && val !== '') {
        cleanParams[key] = String(val);
      }
    }

    const sortedKeys = Object.keys(cleanParams).sort();
    const signData = sortedKeys
      .map((key) => `${key}=${encodeURIComponent(cleanParams[key] ?? '').replace(/%20/g, '+')}`)
      .join('&');

    const hmac = crypto.createHmac('sha512', ENV_CONFIG.VNP_HASH_SECRET);
    const calculatedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (calculatedHash !== secureHash) {
      return { RspCode: '97', Message: 'Chữ ký không hợp lệ' };
    }

    const orderId = query.vnp_TxnRef;
    const order = await this.repo.findOrderById(orderId);
    if (!order) {
      return { RspCode: '01', Message: 'Không tìm thấy đơn hàng' };
    }

    // Kiểm tra số tiền giao dịch hợp lệ
    const vnpAmount = Number(query.vnp_Amount) / 100;
    if (vnpAmount !== order.totalAmount) {
      return { RspCode: '04', Message: 'Số tiền không hợp lệ' };
    }

    // Kiểm tra trạng thái đơn hàng đã xác nhận chưa
    const payment = order.payment;
    if (payment && payment.status !== 'PENDING') {
      return { RspCode: '02', Message: 'Đơn hàng đã được xác nhận trước đó' };
    }

    const responseCode = query.vnp_ResponseCode;
    const transactionStatus = query.vnp_TransactionStatus;
    const vnpTransactionNo = query.vnp_TransactionNo;

    if (responseCode === '00' && transactionStatus === '00') {
      await this.repo.updatePaymentStatus(orderId, 'COMPLETED', vnpTransactionNo);
      await this.repo.updateOrderStatus(orderId, 'PROCESSING');

      // Gửi mail thanh toán thành công
      try {
        const fullOrder = await this.orderRepo.getOrderById(orderId);
        if (fullOrder && fullOrder.customer && fullOrder.customer.email) {
          await BrevoProvider.sendReactMail(
            fullOrder.customer.email,
            `Thanh toán thành công đơn hàng #${fullOrder.id}`,
            'PaymentSuccessEmail',
            { order: fullOrder }
          );
        }
      } catch (error) {
        console.error(`❌ Gửi email thanh toán thành công lỗi (IPN, Order #${orderId}):`, error);
      }
    } else {
      await this.repo.updatePaymentStatus(orderId, 'FAILED', vnpTransactionNo);
      await this.repo.updateOrderStatus(orderId, 'CANCELLED');

      // Gửi mail thanh toán thất bại
      try {
        const fullOrder = await this.orderRepo.getOrderById(orderId);
        if (fullOrder && fullOrder.customer && fullOrder.customer.email) {
          await BrevoProvider.sendReactMail(
            fullOrder.customer.email,
            `Thanh toán thất bại cho đơn hàng #${fullOrder.id}`,
            'PaymentFailedEmail',
            { order: fullOrder }
          );
        }
      } catch (error) {
        console.error(`❌ Gửi email thanh toán thất bại lỗi (IPN, Order #${orderId}):`, error);
      }
    }

    return { RspCode: '00', Message: 'Xác nhận thành công' };
  }
}
