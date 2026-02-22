import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

export type ItineraryDocument = Itinerary & Document;

@Schema({ timestamps: true })
export class Itinerary {
  @Prop({
    type: Types.ObjectId,
    ref: 'Package',
    required: true,
    index: true,
  })
  packageId: Types.ObjectId;

  @Prop({ required: true })
  dayNumber: number;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop([String])
  activities: string[];

  @Prop([String])
  images: string[];
}

export const ItinerarySchema = SchemaFactory.createForClass(Itinerary);

// Prevent duplicate day numbers for same package
ItinerarySchema.index(
  { packageId: 1, dayNumber: 1 },
  { unique: true }
);