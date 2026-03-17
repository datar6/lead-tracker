import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LeadsService } from './leads.service.js';
import { CreateLeadDto } from './dto/create-lead.dto.js';
import { UpdateLeadDto } from './dto/update-lead.dto.js';
import { LeadsQueryDto } from './dto/leads-query.dto.js';

@ApiTags('leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'List leads with pagination, filtering, search, sorting' })
  findAll(@Query() query: LeadsQueryDto) {
    return this.leadsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead by ID' })
  findById(@Param('id') id: string) {
    return this.leadsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a lead' })
  create(@Body() body: CreateLeadDto) {
    return this.leadsService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update a lead (including status change)' })
  update(@Param('id') id: string, @Body() body: UpdateLeadDto) {
    return this.leadsService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a lead' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.leadsService.delete(id);
  }
}
