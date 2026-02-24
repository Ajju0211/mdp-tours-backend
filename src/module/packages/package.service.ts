
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePackageDto } from './dto/create-package.dto';
import { Package } from './schema/package-schema';
import { Itinerary } from '../itinerary/schema/itinerary-schema';

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

  async findAll() {
    return this.packageModel.find({ isActive: true });
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
}