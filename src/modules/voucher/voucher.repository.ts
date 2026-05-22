import { Database } from '@/plugins/database';
import {
  CreateVoucherInput,
  UpdateVoucherInput,
  GetVouchersQueryInput,
} from './voucher.validate';
import { eq, count, ilike, and, desc, lte, gt, or, isNull } from 'drizzle-orm';
import { vouchers } from '@/db/schema';

export class VoucherRepository {
  private db: Database;
  constructor(db: Database) {
    this.db = db;
  }

  async createVoucher(data: CreateVoucherInput) {
    const { expirationDate, ...rest } = data;
    const [voucher] = await this.db
      .insert(vouchers)
      .values({
        ...rest,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
      })
      .returning();
    return voucher;
  }

  async findVoucherByCode(code: string) {
    return this.db.query.vouchers.findFirst({
      where: eq(vouchers.code, code),
    });
  }

  async getVoucherById(id: string) {
    return this.db.query.vouchers.findFirst({
      where: eq(vouchers.id, id),
    });
  }

  async getAllVouchers(query: GetVouchersQueryInput) {
    const { page = 1, limit = 10, search, status } = query;
    const offset = (page - 1) * limit;

    const whereConditions = [];

    if (search) {
      whereConditions.push(ilike(vouchers.code, `%${search}%`));
    }

    const now = new Date();

    if (status === 'ACTIVE') {
      whereConditions.push(eq(vouchers.isActive, true));
      whereConditions.push(
        or(isNull(vouchers.expirationDate), gt(vouchers.expirationDate, now))
      );
    } else if (status === 'PAUSED') {
      whereConditions.push(eq(vouchers.isActive, false));
    } else if (status === 'EXPIRED') {
       whereConditions.push(lte(vouchers.expirationDate, now));
    }

    const allVouchers = await this.db.query.vouchers.findMany({
      limit: limit,
      offset: offset,
      where: and(...whereConditions),
      orderBy: [desc(vouchers.createdAt)],
    });

    const [total] = await this.db.select({ count: count() }).from(vouchers).where(and(...whereConditions));

    return {
      vouchers: allVouchers,
      total: total?.count || 0,
    };
  }

  async updateVoucher(id: string, data: UpdateVoucherInput) {
    const { expirationDate, ...rest } = data;
    const updatePayload: Record<string, any> = { ...rest };
    
    if (expirationDate !== undefined) {
       updatePayload.expirationDate = expirationDate ? new Date(expirationDate) : null;
    }

    const [voucher] = await this.db
      .update(vouchers)
      .set(updatePayload)
      .where(eq(vouchers.id, id))
      .returning();
    return voucher;
  }

  async deleteVoucher(id: string) {
    return this.db.delete(vouchers).where(eq(vouchers.id, id));
  }
}
