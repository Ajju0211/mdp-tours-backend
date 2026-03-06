import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePackageDto } from './dto/create-package.dto';
import { Package } from './schema/package-schema';
import { Itinerary } from '../itinerary/schema/itinerary-schema';
import { CreatePackageWithItineraryDto } from './dto/create-package-with-itinerary.dto';
import { nanoid } from 'nanoid';
import { FindAllPackagesDto } from './interface/package.response';
@Injectable()
export class PackageService {
  constructor(
    @InjectModel(Package.name) private packageModel: Model<Package>,
    @InjectModel(Itinerary.name) private itineraryModel: Model<Itinerary>,
  ) {}

  private generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
  }

  async create(createPackageDto: CreatePackageDto) {
    const slug = this.generateSlug(createPackageDto.title);

    const newPackage = new this.packageModel({
      ...createPackageDto,
      slug,
    });

    return newPackage.save();
  }

  async findAll({
    page,
    limit,
    category,
    isActive,
    isPublic,
  }: FindAllPackagesDto) {
    const query: any = {};

    if (category) query.category = category;

    if (typeof isActive === 'boolean') {
      query.isActive = isActive;
    }

    if (typeof isPublic === 'boolean') {
      query.isPublic = isPublic;
    }

    const data = await this.packageModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    const total = await this.packageModel.countDocuments(query);

    return { data, total };
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid package id');
    }

    const pkg = await this.packageModel.findById(id);

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    const itinerary = await this.itineraryModel
      .findOne({ packageId: pkg._id })
      .sort({ 'days.dayNumber': 1 });

    return {
      package: pkg,
      itinerary,
    };
  }

  async findBySlug(slug: string) {
    const pkg = await this.packageModel.findOne({ slug });

    const itinerary = await this.itineraryModel
      .find({ packageId: pkg?._id })
      .sort({ dayNumber: 1 });

    return {
      package: pkg,
      itinerary,
    };
  }

  // or any slug generator library

  async createPackageWithItinerary(dto: CreatePackageWithItineraryDto) {
    const session = await this.packageModel.db.startSession();
    session.startTransaction();

    try {
      // Generate a unique slug if not provided

      // Convert title to URL-friendly string + unique suffix
      const slug = `${dto.title.toLowerCase().replace(/\s+/g, '-')}-${nanoid(6)}`;

      // Save Package
      const packageDoc = await new this.packageModel({
        ...dto,
        slug,
        availableDates: dto.availableDates.map((d) => new Date(d)),
      }).save({ session });

      // Save Itinerary
      const itineraryDoc = await new this.itineraryModel({
        packageId: packageDoc._id,
        days: dto.itineraryDays,
      }).save({ session });

      await session.commitTransaction();
      session.endSession();

      return { package: packageDoc, itinerary: itineraryDoc };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  async updatePackageWithItinerary(
    packageId: string,
    dto: CreatePackageWithItineraryDto,
  ) {
    const session = await this.packageModel.db.startSession();
    session.startTransaction();

    try {
      // Update Package
      const packageDoc = await this.packageModel.findByIdAndUpdate(
        packageId,
        { ...dto, availableDates: dto.availableDates.map((d) => new Date(d)) },
        { new: true, session },
      );

      // Update or create Itinerary
      const itineraryDoc = await this.itineraryModel.findOneAndUpdate(
        { packageId },
        { days: dto.itineraryDays },
        { new: true, upsert: true, session },
      );

      await session.commitTransaction();
      session.endSession();

      return { package: packageDoc, itinerary: itineraryDoc };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  async deletePackage(packageId: string) {
    if (!Types.ObjectId.isValid(packageId)) {
      throw new BadRequestException('Invalid package id');
    }

    const session = await this.packageModel.db.startSession();
    session.startTransaction();

    try {
      const pkg = await this.packageModel.findByIdAndDelete(packageId, {
        session,
      });

      if (!pkg) {
        throw new NotFoundException('Package not found');
      }

      await this.itineraryModel.deleteMany({ packageId: pkg._id }, { session });

      await session.commitTransaction();
      session.endSession();

      return { message: 'Package deleted successfully' };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }
}
