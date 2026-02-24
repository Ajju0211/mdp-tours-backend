import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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

  @Prop()
  coverImage: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String, enum: ['Family', 'Couple', 'Adventure', 'Luxury', 'Women-only', 'Solo'], default: 'Family' })
  category: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: [String] })
  inclusions: string[];

  @Prop({ type: [String] })
  exclusions: string[];

  @Prop({ type: Number, default: 0 })
  discountPercent: number;

  @Prop({ type: [Date] })
  availableDates: Date[];

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