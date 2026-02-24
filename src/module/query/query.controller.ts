import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query as QueryParam,
} from '@nestjs/common';
import { QueryService } from './query.service';
import { CreateQueryDto } from './dto/create-query.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateNotesDto } from './dto/update-notes.dto';

@Controller('queries')
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  // PUBLIC API
  @Post()
  create(@Body() createQueryDto: CreateQueryDto) {
    return this.queryService.create(createQueryDto);
  }

  // ADMIN API
  @Get()
  findAll(
    @QueryParam('page') page: number,
    @QueryParam('limit') limit: number,
    @QueryParam('status') status?: string,
  ) {
    return this.queryService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
      status,
    );
  }

  // UPDATE STATUS
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.queryService.updateStatus(id, updateStatusDto);
  }

  // UPDATE NOTES
  @Patch(':id/notes')
  updateNotes(
    @Param('id') id: string,
    @Body() updateNotesDto: UpdateNotesDto,
  ) {
    return this.queryService.updateNotes(id, updateNotesDto);
  }

  // query.controller.ts
@Get('count/new')
async getNewCount() {
  return this.queryService.getNewQueryCount();
}
}