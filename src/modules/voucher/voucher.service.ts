import { VoucherRepository } from './voucher.repository';
import {
  CreateVoucherInput,
  UpdateVoucherInput,
  GetVouchersQueryInput,
} from './voucher.validate';
import { ConflictError, NotFoundError, BadRequestError } from '@/utils/errors';

export class VoucherService {
  private repo: VoucherRepository;

  constructor(repo: VoucherRepository) {
    this.repo = repo;
  }

  async createVoucher(data: CreateVoucherInput) {
    const existing = await this.repo.findVoucherByCode(data.code);
    if (existing) {
      throw new ConflictError('Mã giảm giá đã tồn tại');
    }
    return this.repo.createVoucher(data);
  }

  async getVouchers(query: GetVouchersQueryInput) {
    const { vouchers, total } = await this.repo.getAllVouchers(query);

    // Map status for frontend consumption
    const mappedVouchers = vouchers.map((v) => {
      let status: 'ACTIVE' | 'PAUSED' | 'EXPIRED' = 'ACTIVE';
      const now = new Date();

      if (v.expirationDate && v.expirationDate <= now) {
        status = 'EXPIRED';
      } else if (!v.isActive) {
        status = 'PAUSED';
      }

      return {
        ...v,
        status,
      };
    });

    return { vouchers: mappedVouchers, total };
  }

  async getVoucherById(id: string) {
    const voucher = await this.repo.getVoucherById(id);
    if (!voucher) {
      throw new NotFoundError('Không tìm thấy mã giảm giá');
    }

    let status: 'ACTIVE' | 'PAUSED' | 'EXPIRED' = 'ACTIVE';
    const now = new Date();
    if (voucher.expirationDate && voucher.expirationDate <= now) {
      status = 'EXPIRED';
    } else if (!voucher.isActive) {
      status = 'PAUSED';
    }

    return { ...voucher, status };
  }

  async updateVoucher(id: string, data: UpdateVoucherInput) {
    const voucher = await this.repo.getVoucherById(id);
    if (!voucher) {
      throw new NotFoundError('Không tìm thấy mã giảm giá');
    }

    if (data.code && data.code !== voucher.code) {
      const existing = await this.repo.findVoucherByCode(data.code);
      if (existing) {
        throw new ConflictError('Mã giảm giá đã tồn tại');
      }
    }

    return this.repo.updateVoucher(id, data);
  }

  async deleteVoucher(id: string) {
    const voucher = await this.repo.getVoucherById(id);
    if (!voucher) {
      throw new NotFoundError('Không tìm thấy mã giảm giá');
    }
    return this.repo.deleteVoucher(id);
  }

  async toggleVoucherStatus(id: string, isActive: boolean) {
    const voucher = await this.repo.getVoucherById(id);
    if (!voucher) {
      throw new NotFoundError('Không tìm thấy mã giảm giá');
    }
    return this.repo.updateVoucher(id, { isActive });
  }

  async getPublicVouchers() {
    return this.repo.getPublicVouchers();
  }

  async applyVoucher(code: string, orderValue: number) {
    const voucher = await this.repo.findVoucherByCode(code);

    if (!voucher) {
      throw new NotFoundError('Mã giảm giá không tồn tại');
    }

    if (!voucher.isActive) {
      throw new BadRequestError('Mã giảm giá này hiện không khả dụng');
    }

    const now = new Date();
    if (voucher.expirationDate && voucher.expirationDate < now) {
      throw new BadRequestError('Mã giảm giá đã hết hạn sử dụng');
    }

    if (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit) {
      throw new BadRequestError('Mã giảm giá đã hết lượt sử dụng');
    }

    if (orderValue < (voucher.minOrderValue || 0)) {
      throw new BadRequestError(
        `Đơn hàng chưa đạt giá trị tối thiểu ${voucher.minOrderValue?.toLocaleString('vi-VN')}đ`
      );
    }

    return voucher;
  }
}
