import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE_TOKEN, leads } from '../database/index.js';
import type { Lead, NewLead } from '../database/index.js';
import type * as schema from '../database/schema.js';

type DrizzleDb = PostgresJsDatabase<typeof schema>;

@Injectable()
export class LeadsRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDb) {}

  async findAll(): Promise<Lead[]> {
    return this.db.select().from(leads);
  }

  async findById(id: number): Promise<Lead | undefined> {
    const result = await this.db.select().from(leads).where(eq(leads.id, id));
    return result[0];
  }

  async create(data: NewLead): Promise<Lead> {
    const result = await this.db.insert(leads).values(data).returning();
    return result[0];
  }

  async update(id: number, data: Partial<NewLead>): Promise<Lead | undefined> {
    const result = await this.db
      .update(leads)
      .set(data)
      .where(eq(leads.id, id))
      .returning();
    return result[0];
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(leads)
      .where(eq(leads.id, id))
      .returning({ id: leads.id });
    return result.length > 0;
  }
}
