import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  varchar,
  uuid,
  real,
} from 'drizzle-orm/pg-core';

export const leadStatusEnum = pgEnum('lead_status', [
  'NEW',
  'CONTACTED',
  'IN_PROGRESS',
  'WON',
  'LOST',
]);

export const leads = pgTable('leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  company: varchar('company', { length: 255 }),
  status: leadStatusEnum('status').notNull().default('NEW'),
  value: real('value'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id')
    .notNull()
    .references(() => leads.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type LeadComment = typeof comments.$inferSelect;
export type NewLeadComment = typeof comments.$inferInsert;
