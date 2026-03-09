import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { string } from 'joi';
import { Document, Types } from 'mongoose';
import { ImageItem } from 'src/common/class/imageclass';
import { PackageCategory } from 'src/enum/query.enum';

export type PackageDocument = Package & Document;

interface ItineraryItem {
  day: number;
  activities: string[];
}

@Schema({ timestamps: true })
export class Package {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  destinationName: string;

  @Prop({ required: true })
  nights: number;

  @Prop({ required: true })
  days: number;

  @Prop({ required: true })
  pricePerPerson: number;

  @Prop({ type: ImageItem })
  coverImage: ImageItem;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({
    type: [String],
    enum: [
      PackageCategory.FAMILY,
      PackageCategory.COUPLE,
      PackageCategory.ADVENTURE,
      PackageCategory.LUXURY,
      PackageCategory.WOMEN_ONLY,
      PackageCategory.SOLO,
    ],
    default: [PackageCategory.FAMILY],
  })
  category: PackageCategory[];

  @Prop({ type: String })
  description: string;

  @Prop({ type: [String] })
  inclusions: string[];

  @Prop({ type: [String] })
  exclusions: string[];

  @Prop({ type: Number, default: 0 })
  discountPercent: number;

  @Prop({ type: [String] })
  availableDates: string[];

  @Prop({ type: Number, default: 0 })
  rating: number;

  @Prop({ type: Number, default: 0 })
  reviewsCount: number;

  @Prop({ type: String })
  metaTitle: string;

  @Prop({ type: String })
  metaDescription: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId; // admin/vendor reference
}

export const PackageSchema = SchemaFactory.createForClass(Package);

// Optional: add indexes for better filtering
PackageSchema.index({ category: 1, pricePerPerson: 1, destinationName: 1 });
