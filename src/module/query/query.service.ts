import { Injectable } from '@nestjs/common';
import { BaseException } from '../../common/exceptions/base.exception';
import { ERROR_CODES } from '../../common/exceptions/error-codes.enum';
import { QueryNotFoundException } from './exceptions/query.exception';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Query, QueryDocument } from './schema/query-schema';
import { CreateQueryDto } from './dto/create-query.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateNotesDto } from './dto/update-notes.dto';

@Injectable()
export class QueryService {
  constructor(
    @InjectModel(Query.name)
    private queryModel: Model<QueryDocument>,
  ) {}

  /**
   * Creates a new user query submission.
   * This is a public-facing endpoint for capturing leads or customer inquiries.
   * 
   * @param createQueryDto - Data transfer object containing the query details
   * @returns An object containing the success status and the created query data
   */
  async create(createQueryDto: CreateQueryDto) {
    const query = await this.queryModel.create(createQueryDto);
    return {
      success: true,
      message: 'Query submitted successfully',
      data: query,
    };
  }

  /**
   * Retrieves a paginated list of queries with optional filtering.
   * Intended for administrative dashboard use.
   * 
   * @param page - Current page number for pagination
   * @param limit - Number of records per page
   * @param status - Optional filter to retrieve queries by a specific status
   * @param packageId - Optional filter to retrieve queries associated with a specific package
   * @returns Paginated result set including total count and query data
   */
  async findAll(page = 1, limit = 10, status?: string, packageId?: string) {
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status) filter.status = status;
    if (packageId) filter.packageId = packageId;

    const [queries, total] = await Promise.all([
      this.queryModel
        .find(filter)
        .populate('packageId', 'title slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.queryModel.countDocuments(filter),
    ]);

    return {
      success: true,
      total,
      page,
      limit,
      data: queries,
    };
  }

  /**
   * Updates the lifecycle status of a specific query.
   * 
   * @param id - The unique identifier of the query to update
   * @param updateStatusDto - Data transfer object containing the new status
   * @throws QueryNotFoundException if the query is not found
   * @returns The updated query record
   */
  async updateStatus(id: string, updateStatusDto: UpdateStatusDto) {
    const query = await this.queryModel.findByIdAndUpdate(
      id,
      { status: updateStatusDto.status },
      { new: true },
    );

    if (!query) throw new QueryNotFoundException();

    return {
      success: true,
      message: 'Status updated successfully',
      data: query,
    };
  }

  /**
   * Appends or updates administrative notes for a specific query.
   * 
   * @param id - The unique identifier of the query
   * @param updateNotesDto - Data transfer object containing the notes
   * @throws QueryNotFoundException if the query is not found
   * @returns The updated query record
   */
  async updateNotes(id: string, updateNotesDto: UpdateNotesDto) {
    const query = await this.queryModel.findByIdAndUpdate(
      id,
      { notes: updateNotesDto.notes },
      { new: true },
    );

    if (!query) throw new QueryNotFoundException();

    return {
      success: true,
      message: 'Notes updated successfully',
      data: query,
    };
  }

  /**
   * Retrieves the total count of newly submitted queries.
   * Useful for administrative dashboards or notification badges.
   * 
   * @returns An object containing the count of queries with a 'NEW' status
   */
  async getNewQueryCount() {
    const count = await this.queryModel.countDocuments({
      status: 'NEW',
    });

    return { count };
  }

  /**
   * Permanently deletes a query from the database.
   * 
   * @param id - The unique identifier of the query to delete
   * @throws QueryNotFoundException if the query is not found
   * @returns A success response containing the deleted query data
   */
  async remove(id: string) {
    const query = await this.queryModel.findByIdAndDelete(id);

    if (!query) throw new QueryNotFoundException();

    return {
      success: true,
      message: 'Query deleted successfully',
      data: query,
    };
  }
}