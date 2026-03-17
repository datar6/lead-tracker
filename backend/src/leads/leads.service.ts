import { Injectable, NotFoundException } from '@nestjs/common';
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

  create(data: CreateLeadDto): Promise<Lead> {
    return this.leadsRepository.create(data);
  }

  async update(id: string, data: UpdateLeadDto): Promise<Lead> {
    const lead = await this.leadsRepository.update(id, data);
    if (!lead) throw new NotFoundException(`Lead with id ${id} not found`);
    return lead;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.leadsRepository.delete(id);
    if (!deleted) throw new NotFoundException(`Lead with id ${id} not found`);
  }
}
