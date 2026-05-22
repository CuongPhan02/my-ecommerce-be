import {
  pgTable,
  text,
  timestamp,
  boolean,
  doublePrecision,
  integer,
} from 'drizzle-orm/pg-core';
import { cuid, timestamps, voucherTypeEnum } from '../_helpers';

export const vouchers = pgTable('voucher', {
  id: text('id')
    .$defaultFn(() => cuid())
    .primaryKey(),
  code: text('code').unique().notNull(), // VD: SUMMER50K
  description: text('description'), // Nhập mô tả và thông tin chương trình...
  type: voucherTypeEnum('type').notNull(), // Giảm giá theo Phần trăm, Số tiền cố định, Hỗ trợ ship
  discountValue: doublePrecision('discount_value').notNull(), // Mức giảm tối đa (Tối đa 100%) hoặc Số tiền
  minOrderValue: doublePrecision('min_order_value').default(0), // Giá trị đơn hàng tối thiểu
  usageLimit: integer('usage_limit'), // Giới hạn lượt sử dụng
  usedCount: integer('used_count').default(0), // Đã dùng
  isActive: boolean('is_active').default(true), // Trạng thái mã ngay khi lưu
  expirationDate: timestamp('expiration_date'), // Hạn sử dụng
  ...timestamps,
});
