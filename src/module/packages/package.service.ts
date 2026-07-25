import { Injectable } from '@nestjs/common';
import { BaseException } from '../../common/exceptions/base.exception';
import { ERROR_CODES } from '../../common/exceptions/error-codes.enum';
import { PackageNotFoundException } from './exceptions/package.exception';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Package, PackageDocument } from './schema/package-schema';
import { Itinerary, ItineraryDocument } from '../itinerary/schema/itinerary-schema';
import { CreatePackageWithItineraryDto } from './dto/create-package-with-itinerary.dto';
import { IdUtil } from '../../common/utils/id.util';
import { FindAllPackagesDto } from './interface/package.response';
import { GetPackagesFilterDto } from './dto/get-packages-filter.dto';

/**
 * Service responsible for managing travel packages and their associated itineraries.
 * Handles database operations including creation, retrieval, updates, deletions,
 * and complex search queries leveraging MongoDB transactions and aggregations.
 */
@Injectable()
export class PackageService {
  constructor(
    @InjectModel(Package.name) private packageModel: Model<PackageDocument>,
    @InjectModel(Itinerary.name) private itineraryModel: Model<ItineraryDocument>,
  ) { }

  /**
   * Generates a unique, URL-friendly slug from a given title string.
   * Strips special characters, normalizes whitespace, and appends a short ID
   * to guarantee uniqueness across packages with identical titles.
   *
   * @param title - The raw title of the package.
   * @returns A sanitized, URL-safe string.
   */
  private generateSlug(title: string): string {
    return `${title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with -
      .replace(/^-+|-+$/g, '')}-${IdUtil.generateShortId(6)}`;
  }

  /**
   * Creates a new travel package along with its associated itinerary.
   * This operation executes within a MongoDB transaction to ensure atomic
   * creation of both records. If either operation fails, changes are rolled back.
   *
   * @param dto - The payload containing package details and itinerary days.
   * @returns An object containing the successfully created package and itinerary documents.
   * @throws Reraises any database or validation errors encountered during the transaction.
   */
  async createPackageWithItinerary(dto: CreatePackageWithItineraryDto) {
    const session = await this.packageModel.db.startSession();
    session.startTransaction();

    try {
      const { itineraryDays, ...packageData } = dto;
      const slug = this.generateSlug(dto.title);

      // 1. Create Package
      const [packageDoc] = await this.packageModel.create(
        [
          {
            ...packageData,
            slug,
            availableDates: dto.availableDates,
          },
        ],
        { session },
      );

      // 2. Create Itinerary linked to Package
      const [itineraryDoc] = await this.itineraryModel.create(
        [
          {
            packageId: packageDoc._id,
            slug,
            days: itineraryDays,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      return { package: packageDoc, itinerary: itineraryDoc };
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  /**
   * Retrieves a paginated list of packages based on provided administrative filters.
   *
   * @param queryDto - The filtering and pagination parameters.
   * @returns A paginated response object containing the retrieved packages and metadata.
   */
  async findAll(queryDto: FindAllPackagesDto) {
    const { page = 1, limit = 10, category, isActive, isPublic } = queryDto;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (category) filter.category = { $in: [category] }; // Matches if category exists in array
    if (typeof isActive === 'boolean') filter.isActive = isActive;
    if (typeof isPublic === 'boolean') filter.isPublic = isPublic;

    const [data, total] = await Promise.all([
      this.packageModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      this.packageModel.countDocuments(filter),
    ]);

    return { data, total, page: Number(page), lastPage: Math.ceil(total / limit) };
  }

  /**
   * Retrieves a single package and its full itinerary by its unique slug.
   *
   * @param slug - The unique slug identifier of the package.
   * @returns The requested package and its associated itinerary.
   * @throws {PackageNotFoundException} If no package matches the provided slug.
   */
  async findBySlug(slug: string) {
    const pkg = await this.packageModel.findOne({ slug }).lean();
    if (!pkg) throw new PackageNotFoundException(`Package with slug ${slug} not found`);

    const itinerary = await this.itineraryModel
      .findOne({ packageId: pkg._id })
      .lean();

    return { package: pkg, itinerary };
  }


  /**
   * Retrieves a package and its itinerary by the internal package ID, omitting
   * sensitive or internal metadata fields (e.g., standard MongoDB fields).
   *
   * @param id - The unique MongoDB ObjectId of the package.
   * @returns The requested package and its associated itinerary.
   * @throws {PackageNotFoundException} If no package matches the provided ID.
   */
  async findById(id: string) {
    const pkg = await this.packageModel
      .findById(id)
      .select(
        '-_id -slug -rating -reviewsCount -createdAt -updatedAt -__v'
      )
      .lean();

    if (!pkg) throw new PackageNotFoundException(`Package with id ${id} not found`);

    const itinerary = await this.itineraryModel
      .findOne({ packageId: new Types.ObjectId(id) })
      .select('-_id -slug -createdAt -updatedAt -__v')
      .lean();

    return { package: pkg, itinerary };
  }

  /**
   * Updates an existing travel package and its associated itinerary.
   * Executes within a MongoDB transaction to guarantee atomic updates.
   * If the itinerary does not exist, it will be created via upsert.
   *
   * @param packageId - The unique MongoDB ObjectId of the package to update.
   * @param dto - The payload containing the updated package and itinerary details.
   * @returns An object containing the updated package and itinerary documents.
   * @throws {BaseException} If the provided package ID is invalid.
   * @throws {PackageNotFoundException} If the package cannot be found to update.
   */
  async updatePackageWithItinerary(packageId: string, dto: CreatePackageWithItineraryDto) {
    if (!Types.ObjectId.isValid(packageId)) throw new BaseException(ERROR_CODES.BAD_REQUEST.code, 'Invalid ID');

    const session = await this.packageModel.db.startSession();
    session.startTransaction();

    try {
      const { itineraryDays, ...packageData } = dto;

      // Update Package (Update basic info)
      const updatedPackage = await this.packageModel.findByIdAndUpdate(
        packageId,
        {
          ...packageData,
          availableDates: dto.availableDates
        },
        { new: true, session },
      );

      if (!updatedPackage) throw new PackageNotFoundException();

      // Update Itinerary (Upsert ensures it creates one if it didn't exist)
      const updatedItinerary = await this.itineraryModel.findOneAndUpdate(
        { packageId: new Types.ObjectId(packageId) },
        { days: itineraryDays },
        { new: true, upsert: true, session },
      );

      await session.commitTransaction();
      return { package: updatedPackage, itinerary: updatedItinerary };
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  /**
   * Deletes a package and forcefully cleans up its orphaned itinerary document.
   * Executes within a MongoDB transaction to guarantee atomicity.
   *
   * @param packageId - The unique MongoDB ObjectId of the package to delete.
   * @returns A success status message upon successful deletion.
   * @throws {BaseException} If the provided package ID is invalid.
   * @throws {PackageNotFoundException} If the package cannot be found for deletion.
   */
  async deletePackage(packageId: string) {
    if (!Types.ObjectId.isValid(packageId)) throw new BaseException(ERROR_CODES.BAD_REQUEST.code, 'Invalid ID');

    const session = await this.packageModel.db.startSession();
    session.startTransaction();

    try {
      const pkg = await this.packageModel.findByIdAndDelete(packageId, { session });
      if (!pkg) throw new PackageNotFoundException();

      // Clean up orphaned itinerary
      await this.itineraryModel.deleteMany({ packageId: pkg._id }, { session });

      await session.commitTransaction();
      return { success: true, message: 'Package and its itinerary deleted' };
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }


  /**
   * Retrieves a limited set of the most recently created packages that are 
   * both active and marked for public viewing.
   *
   * @returns A limited array of published packages and their total count.
   */
  async getActiveAndPublishedPackages() {
    const data = await this.packageModel
      .find({ isActive: true, isPublic: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    return { data, total: data.length };
  }

  /**
   * Executes a robust search and filtering aggregation pipeline for packages.
   * Leverages MongoDB Atlas Search for text queries and standard aggregations
   * for precise numeric/array matching and cursor-based pagination.
   *
   * @param filterDto - The diverse set of filters and cursor parameters.
   * @returns A paginated response configured for infinite scrolling.
   */
  async getFilteredPackages(filterDto: GetPackagesFilterDto) {
    const {
      q,
      minPrice,
      maxPrice,
      category,
      type,
      minGroupSize,
      maxGroupSize,
      limit = 10,
      cursor
    } = filterDto;

    // Query params arrive as strings, ensure limit is a number
    const numericLimit = Number(limit);

    const pipeline: any[] = [];

    // Step 1: Atlas Search (if query provided)
    if (q) {
      pipeline.push({
        $search: {
          index: "default",
          text: {
            query: q,
            path: ["title", "destinationName", "description"],
            fuzzy: { maxEdits: 2 }
          }
        }
      });
    }

    // Step 2: Apply Filters
    const match: any = {
      isActive: true,
      isPublic: true
    };

    if (minPrice || maxPrice) {
      match.pricePerPerson = {};
      if (minPrice) match.pricePerPerson.$gte = Number(minPrice);
      if (maxPrice) match.pricePerPerson.$lte = Number(maxPrice);
    }

    // category is an array field in schema, use $in to match
    if (category) match.category = { $in: [category] };
    if (type) match.type = { $in: [type] };
    if (minGroupSize) match.maxGroupSize = { $gte: Number(minGroupSize) };
    if (maxGroupSize) match.minGroupSize = { $lte: Number(maxGroupSize) };

    pipeline.push({ $match: match });

    // Step 3: Cursor condition for infinite scroll
    if (cursor) {
      pipeline.push({
        $match: {
          _id: { $lt: new Types.ObjectId(cursor) }
        }
      });
    }

    // Step 4: Sort (default by newest)
    pipeline.push({
      $sort: { _id: -1 }
    });

    // Step 5: Fetch one extra record to determine 'hasMore' pagination state
    pipeline.push({ $limit: numericLimit + 1 });

    const packages = await this.packageModel.aggregate(pipeline);

    const hasMore = packages.length > numericLimit;
    const results = hasMore ? packages.slice(0, numericLimit) : packages;

    // Next cursor
    const nextCursor =
      results.length > 0
        ? results[results.length - 1]._id
        : null;

    return {
      data: results,
      nextCursor,
      hasMore,
    };
  }
}