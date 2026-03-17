import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { LeadsService } from './leads.service.js';
import type { Lead, NewLead } from '../database/index.js';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  findAll(): Promise<Lead[]> {
    return this.leadsService.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number): Promise<Lead> {
    return this.leadsService.findById(id);
  }

  @Post()
  create(@Body() body: NewLead): Promise<Lead> {
    return this.leadsService.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<NewLead>,
  ): Promise<Lead> {
    return this.leadsService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.leadsService.delete(id);
  }
}
