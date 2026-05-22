import { VoucherRepository } from './voucher.repository';
import {
  CreateVoucherInput,
  UpdateVoucherInput,
  GetVouchersQueryInput,
} from './voucher.validate';
import { ConflictError, NotFoundError } from '@/utils/errors';

export class VoucherService {
  private repo: VoucherRepository;

  constructor(repo: VoucherRepository) {
    this.repo = repo;
  }

  async createVoucher(data: CreateVoucherInput) {
    const existing = await this.repo.findVoucherByCode(data.code);
    if (existing) {
      throw new ConflictError('Voucher code already exists');
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
      throw new NotFoundError('Voucher not found');
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
      throw new NotFoundError('Voucher not found');
    }

    if (data.code && data.code !== voucher.code) {
      const existing = await this.repo.findVoucherByCode(data.code);
      if (existing) {
        throw new ConflictError('Voucher code already exists');
      }
    }

    return this.repo.updateVoucher(id, data);
  }

  async deleteVoucher(id: string) {
    const voucher = await this.repo.getVoucherById(id);
    if (!voucher) {
      throw new NotFoundError('Voucher not found');
    }
    return this.repo.deleteVoucher(id);
  }

  async toggleVoucherStatus(id: string, isActive: boolean) {
    const voucher = await this.repo.getVoucherById(id);
    if (!voucher) {
      throw new NotFoundError('Voucher not found');
    }
    return this.repo.updateVoucher(id, { isActive });
  }
}
