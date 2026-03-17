import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';

@ApiTags('comments')
@Controller('leads/:leadId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({ summary: 'List comments for a lead' })
  findAll(@Param('leadId') leadId: string) {
    return this.commentsService.findByLeadId(leadId);
  }

  @Post()
  @ApiOperation({ summary: 'Add a comment to a lead' })
  create(@Param('leadId') leadId: string, @Body() body: CreateCommentDto) {
    return this.commentsService.create(leadId, body);
  }
}
