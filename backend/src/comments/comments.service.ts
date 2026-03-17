import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository.js';
import { LeadsService } from '../leads/leads.service.js';
import type { LeadComment } from '../database/index.js';
import type { CreateCommentDto } from './dto/create-comment.dto.js';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly leadsService: LeadsService,
  ) {}

  async findByLeadId(leadId: string): Promise<LeadComment[]> {
    // Delegates lead existence check to LeadsService (throws NotFoundException if not found)
    await this.leadsService.findById(leadId);
    return this.commentsRepository.findByLeadId(leadId);
  }

  async create(leadId: string, dto: CreateCommentDto): Promise<LeadComment> {
    await this.leadsService.findById(leadId);
    return this.commentsRepository.create({ leadId, text: dto.text });
  }
}
