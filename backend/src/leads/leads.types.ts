import type { Lead, leadStatusEnum } from '../database/index.js';

export type LeadStatusValue = (typeof leadStatusEnum.enumValues)[number];

export interface PaginatedLeads {
  data: Lead[];
  total: number;
  page: number;
  limit: number;
}

export interface LeadsFindAllQuery {
  page?: number;
  limit?: number;
  status?: LeadStatusValue;
  q?: string;
  sort?: string;
  order?: string;
}
