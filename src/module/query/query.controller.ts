import {
  Body,
  Controller,
  Delete,
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
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Queries')
@Controller('queries')
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  /**
   * Endpoint to create a new query.
   * This is a public API used by customers to submit inquiries.
   * 
   * @param createQueryDto - The query details submitted by the user
   * @returns The created query record
   */
  @Post()
  @ApiOperation({ summary: 'Create a new query (Public)' })
  create(@Body() createQueryDto: CreateQueryDto) {
    return this.queryService.create(createQueryDto);
  }

  /**
   * Endpoint to retrieve all queries.
   * Requires administrative privileges. Supports pagination and filtering.
   * 
   * @param page - The page number for pagination
   * @param limit - The maximum number of records to return
   * @param status - Optional filter for query status
   * @param packageId - Optional filter for specific package queries
   * @returns A paginated list of queries
   */
  @Get()
  @ApiOperation({ summary: 'Get all queries with pagination and filters (Admin)' })
  findAll(
    @QueryParam('page') page: number,
    @QueryParam('limit') limit: number,
    @QueryParam('status') status?: string,
    @QueryParam('packageId') packageId?: string,
  ) {
    return this.queryService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
      status,
      packageId,
    );
  }

  /**
   * Endpoint to update the lifecycle status of a specific query.
   * 
   * @param id - The unique identifier of the query
   * @param updateStatusDto - The new status to apply
   * @returns The updated query record
   */
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update query status' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.queryService.updateStatus(id, updateStatusDto);
  }

  /**
   * Endpoint to append or update internal administrative notes on a query.
   * 
   * @param id - The unique identifier of the query
   * @param updateNotesDto - The notes content to update
   * @returns The updated query record
   */
  @Patch(':id/notes')
  @ApiOperation({ summary: 'Update query internal notes' })
  updateNotes(
    @Param('id') id: string,
    @Body() updateNotesDto: UpdateNotesDto,
  ) {
    return this.queryService.updateNotes(id, updateNotesDto);
  }

  /**
   * Endpoint to retrieve the total count of new, unprocessed queries.
   * 
   * @returns The count of queries in the 'NEW' state
   */
  @Get('count/new')
  @ApiOperation({ summary: 'Get count of new queries' })
  async getNewCount() {
    return this.queryService.getNewQueryCount();
  }

  /**
   * Endpoint to permanently delete a query.
   * 
   * @param id - The unique identifier of the query to remove
   * @returns A success confirmation
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a query' })
  remove(@Param('id') id: string) {
    return this.queryService.remove(id);
  }
}