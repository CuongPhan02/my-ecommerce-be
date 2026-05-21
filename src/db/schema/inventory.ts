import {
  pgTable,
  text,
  timestamp,
  integer,
  doublePrecision,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { cuid, timestamps } from '../_helpers';
import { productVariants } from './products';
import { users } from './users';

export const inventoryTransactionTypeEnum = pgEnum('inventory_transaction_type', [
  'IMPORT',
  'ADJUST',
  'EXPORT',
]);

export const inventoryTransactions = pgTable(
  'inventory_transaction',
  {
    id: text('id')
      .$defaultFn(() => cuid())
      .primaryKey(),
    productVariantId: text('product_variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'cascade' }),
    type: inventoryTransactionTypeEnum('type').notNull(),
    quantity: integer('quantity').notNull(),
    purchasePrice: doublePrecision('purchase_price'),
    supplier: text('supplier'),
    reason: text('reason'),
    createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
    ...timestamps,
  },
  (table) => [
    index('inventory_transaction_variant_idx').on(table.productVariantId),
  ]
);

export const inventoryTransactionsRelations = relations(
  inventoryTransactions,
  ({ one }) => ({
    productVariant: one(productVariants, {
      fields: [inventoryTransactions.productVariantId],
      references: [productVariants.id],
    }),
    creator: one(users, {
      fields: [inventoryTransactions.createdBy],
      references: [users.id],
    }),
  })
);
