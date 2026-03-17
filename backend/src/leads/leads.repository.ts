import { Inject, Injectable } from '@nestjs/common';
import { and, asc, desc, eq, ilike, or, SQL } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE_TOKEN, leads } from '../database/index.js';
import type { Lead, NewLead } from '../database/index.js';
import type * as schema from '../database/schema.js';
import { SortOrder } from './dto/leads-query.dto.js';
import type { PaginatedLeads, LeadsFindAllQuery } from './leads.types.js';

type DrizzleDb = PostgresJsDatabase<typeof schema>;

@Injectable()
export class LeadsRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDb) {}

  async findAll(query: LeadsFindAllQuery): Promise<PaginatedLeads> {
    const { page = 1, limit = 20, status, q, sort = 'createdAt', order = SortOrder.DESC } = query;
    const offset = (page - 1) * limit;

    const filters: SQL[] = [];
    if (status) filters.push(eq(leads.status, status));
    if (q) {
      filters.push(
        or(
          ilike(leads.name, `%${q}%`),
          ilike(leads.email, `%${q}%`),
          ilike(leads.company, `%${q}%`),
        ) as SQL,
      );
    }

    const where = filters.length > 0 ? and(...filters) : undefined;

    const sortCol = sort === 'updatedAt' ? leads.updatedAt : leads.createdAt;
    const orderFn = order === SortOrder.ASC ? asc : desc;

    const [data, countResult] = await Promise.all([
      this.db
        .select()
        .from(leads)
        .where(where)
        .orderBy(orderFn(sortCol))
        .limit(limit)
        .offset(offset),
      this.db.select({ id: leads.id }).from(leads).where(where),
    ]);

    return { data, total: countResult.length, page, limit };
  }

  async findById(id: string): Promise<Lead | undefined> {
    const result = await this.db.select().from(leads).where(eq(leads.id, id));
    return result[0];
  }

  async create(data: NewLead): Promise<Lead> {
    const result = await this.db.insert(leads).values(data).returning();
    return result[0];
  }

  async update(id: string, data: Partial<NewLead>): Promise<Lead | undefined> {
    const result = await this.db
      .update(leads)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(leads)
      .where(eq(leads.id, id))
      .returning({ id: leads.id });
    return result.length > 0;
  }
}
