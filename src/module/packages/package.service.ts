import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Package, PackageDocument } from './schema/package-schema';
import { Itinerary, ItineraryDocument } from '../itinerary/schema/itinerary-schema';
import { CreatePackageWithItineraryDto } from './dto/create-package-with-itinerary.dto';
import { nanoid } from 'nanoid';
import { FindAllPackagesDto } from './interface/package.response';

@Injectable()
export class PackageService {
  constructor(
    @InjectModel(Package.name) private packageModel: Model<PackageDocument>,
    @InjectModel(Itinerary.name) private itineraryModel: Model<ItineraryDocument>,
  ) { }

  private generateSlug(title: string): string {
    return `${title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with -
      .replace(/^-+|-+$/g, '')}-${nanoid(6)}`;
  }

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

  async findBySlug(slug: string) {
    const pkg = await this.packageModel.findOne({ slug }).lean();
    if (!pkg) throw new NotFoundException(`Package with slug ${slug} not found`);

    const itinerary = await this.itineraryModel
      .findOne({ packageId: pkg._id })
      .lean();

    return { package: pkg, itinerary };
  }


  async findById(id: string) {
    const pkg = await this.packageModel
      .findById(id)
      .select(
        '-_id -slug -rating -reviewsCount -createdAt -updatedAt -__v'
      )
      .lean();

    if (!pkg) throw new NotFoundException(`Package with id ${id} not found`);

    const itinerary = await this.itineraryModel
      .findOne({ packageId: new Types.ObjectId(id) })
      .select('-_id -slug -createdAt -updatedAt -__v')
      .lean();

    return { package: pkg, itinerary };
  }

  async updatePackageWithItinerary(packageId: string, dto: CreatePackageWithItineraryDto) {
    if (!Types.ObjectId.isValid(packageId)) throw new BadRequestException('Invalid ID');

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

      if (!updatedPackage) throw new NotFoundException('Package not found');

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

  async deletePackage(packageId: string) {
    if (!Types.ObjectId.isValid(packageId)) throw new BadRequestException('Invalid ID');

    const session = await this.packageModel.db.startSession();
    session.startTransaction();

    try {
      const pkg = await this.packageModel.findByIdAndDelete(packageId, { session });
      if (!pkg) throw new NotFoundException('Package not found');

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
}