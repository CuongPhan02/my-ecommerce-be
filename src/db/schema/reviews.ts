import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { cuid, timestamps } from '../_helpers';
import { products, productVariants } from './products';
import { users } from './users';

export const reviewStatusEnum = pgEnum('review_status', [
  'PENDING',
  'APPROVED',
  'HIDDEN',
]);

export const reviews = pgTable(
  'review',
  {
    id: text('id')
      .$defaultFn(() => cuid())
      .primaryKey(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    productVariantId: text('product_variant_id')
      .references(() => productVariants.id, { onDelete: 'set null' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(), // 1 to 5 stars
    content: text('content').notNull(),
    tags: text('tags').array(), // E.g. ['Sản phẩm đẹp', 'Giá tốt']
    status: reviewStatusEnum('status').default('PENDING').notNull(),
    adminReply: text('admin_reply'),
    adminReplyAt: timestamp('admin_reply_at'),
    adminReplyBy: text('admin_reply_by').references(() => users.id, { onDelete: 'set null' }),
    ...timestamps,
  },
  (table) => [
    index('review_product_idx').on(table.productId),
    index('review_user_idx').on(table.userId),
    index('review_status_idx').on(table.status),
  ]
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  productVariant: one(productVariants, {
    fields: [reviews.productVariantId],
    references: [productVariants.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  repliedBy: one(users, {
    fields: [reviews.adminReplyBy],
    references: [users.id],
  }),
}));
