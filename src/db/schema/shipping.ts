import { pgTable, text, doublePrecision, boolean } from 'drizzle-orm/pg-core';
import { cuid, timestamps } from '../_helpers';

export const shippingMethods = pgTable('shipping_method', {
  id: text('id')
    .$defaultFn(() => cuid())
    .primaryKey(),
  name: text('name').notNull(),
  fee: doublePrecision('fee').notNull(),
  estimatedDays: text('estimated_days'),
  isActive: boolean('is_active').default(true),
  ...timestamps,
});
