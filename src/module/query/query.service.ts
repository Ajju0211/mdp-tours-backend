import { Injectable, NotFoundException } from '@nestjs/common';
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

  // 1️⃣ Create Query (Public)
  async create(createQueryDto: CreateQueryDto) {
    const query = await this.queryModel.create(createQueryDto);
    return {
      success: true,
      message: 'Query submitted successfully',
      data: query,
    };
  }

  // 2️⃣ Get All Queries (Admin)
  async findAll(page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status) filter.status = status;

    const [queries, total] = await Promise.all([
      this.queryModel
        .find(filter)
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

  // 3️⃣ Update Status
  async updateStatus(id: string, updateStatusDto: UpdateStatusDto) {
    const query = await this.queryModel.findByIdAndUpdate(
      id,
      { status: updateStatusDto.status },
      { new: true },
    );

    if (!query) throw new NotFoundException('Query not found');

    return {
      success: true,
      message: 'Status updated successfully',
      data: query,
    };
  }

  // 4️⃣ Update Notes
  async updateNotes(id: string, updateNotesDto: UpdateNotesDto) {
    const query = await this.queryModel.findByIdAndUpdate(
      id,
      { notes: updateNotesDto.notes },
      { new: true },
    );

    if (!query) throw new NotFoundException('Query not found');

    return {
      success: true,
      message: 'Notes updated successfully',
      data: query,
    };
  }

  // query.service.ts
async getNewQueryCount() {
  const count = await this.queryModel.countDocuments({
    status: 'NEW',
  });

  return { count };
}
}