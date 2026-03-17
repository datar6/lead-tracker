import { Injectable, NotFoundException } from '@nestjs/common';
import { LeadsRepository } from './leads.repository.js';
import type { Lead, NewLead } from '../database/index.js';

@Injectable()
export class LeadsService {
  constructor(private readonly leadsRepository: LeadsRepository) {}

  findAll(): Promise<Lead[]> {
    return this.leadsRepository.findAll();
  }

  async findById(id: number): Promise<Lead> {
    const lead = await this.leadsRepository.findById(id);
    if (!lead) {
      throw new NotFoundException(`Lead with id ${id} not found`);
    }
    return lead;
  }

  create(data: NewLead): Promise<Lead> {
    return this.leadsRepository.create(data);
  }

  async update(id: number, data: Partial<NewLead>): Promise<Lead> {
    const lead = await this.leadsRepository.update(id, data);
    if (!lead) {
      throw new NotFoundException(`Lead with id ${id} not found`);
    }
    return lead;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.leadsRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Lead with id ${id} not found`);
    }
  }
}
