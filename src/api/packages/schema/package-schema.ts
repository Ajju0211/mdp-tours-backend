import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PackageDocument = Package & Document;

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
}

export const PackageSchema = SchemaFactory.createForClass(Package);