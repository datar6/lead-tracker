import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { LeadsRepository } from './leads.repository.js';
import type { PaginatedLeads } from './leads.types.js';
import type { Lead } from '../database/index.js';
import type { CreateLeadDto } from './dto/create-lead.dto.js';
import type { UpdateLeadDto } from './dto/update-lead.dto.js';
import type { LeadsQueryDto } from './dto/leads-query.dto.js';

@Injectable()
export class LeadsService {
  constructor(private readonly leadsRepository: LeadsRepository) {}

  findAll(query: LeadsQueryDto): Promise<PaginatedLeads> {
    return this.leadsRepository.findAll(query);
  }

  async findById(id: string): Promise<Lead> {
    const lead = await this.leadsRepository.findById(id);
    if (!lead) throw new NotFoundException(`Lead with id ${id} not found`);
    return lead;
  }

  async create(data: CreateLeadDto): Promise<Lead> {
    try {
      return await this.leadsRepository.create(data);
    } catch (e: any) {
      if (isDuplicateEmailError(e)) {
        throw new ConflictException(`A lead with email "${data.email}" already exists`);
      }
      throw e;
    }
  }

  async update(id: string, data: UpdateLeadDto): Promise<Lead> {
    try {
      const lead = await this.leadsRepository.update(id, data);
      if (!lead) throw new NotFoundException(`Lead with id ${id} not found`);
      return lead;
    } catch (e: any) {
      if (isDuplicateEmailError(e)) {
        throw new ConflictException(`A lead with email "${data.email}" already exists`);
      }
      throw e;
    }
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.leadsRepository.delete(id);
    if (!deleted) throw new NotFoundException(`Lead with id ${id} not found`);
  }
}

function isDuplicateEmailError(e: any): boolean {
  const pg = e?.code === '23505' ? e : e?.cause;
  return pg?.code === '23505' && pg?.constraint_name === 'leads_email_unique';
}
