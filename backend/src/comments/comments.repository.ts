import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE_TOKEN, comments } from '../database/index.js';
import type { LeadComment, NewLeadComment } from '../database/index.js';
import type * as schema from '../database/schema.js';

type DrizzleDb = PostgresJsDatabase<typeof schema>;

@Injectable()
export class CommentsRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDb) {}

  async findByLeadId(leadId: string): Promise<LeadComment[]> {
    return this.db
      .select()
      .from(comments)
      .where(eq(comments.leadId, leadId))
      .orderBy(comments.createdAt);
  }

  async create(data: NewLeadComment): Promise<LeadComment> {
    const result = await this.db.insert(comments).values(data).returning();
    return result[0];
  }
}
