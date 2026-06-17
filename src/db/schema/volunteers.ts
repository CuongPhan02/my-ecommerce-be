import { pgTable, text } from 'drizzle-orm/pg-core';
import { cuid, timestamps } from '../_helpers';

export const volunteers = pgTable('volunteer', {
  id: text('id')
    .$defaultFn(() => cuid())
    .primaryKey(),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  message: text('message'),
  ...timestamps,
});
