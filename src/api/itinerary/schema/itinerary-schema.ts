import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

export type ItineraryDocument = Itinerary & Document;

class DayPlan {
  @Prop({ required: true })
  dayNumber: number;

  @Prop({ required: true })
  title: string; // e.g., Arrival & Sightseeing

  @Prop()
  description: string;

  @Prop([String])
  activities: string[];

  @Prop([String])
  images: string[];

  @Prop({ type: [String], default: [] })
  optionalActivities: string[];

  @Prop({
    type: {
      breakfast: { type: String, default: '' },
      lunch: { type: String, default: '' },
      dinner: { type: String, default: '' },
    },
    default: {},
  })
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };

  @Prop({ type: { lat: Number, lng: Number } })
  location: {
    lat: number;
    lng: number;
  };

  @Prop()
  transport: string;

  @Prop([String])
  videos: string[];

  @Prop()
  notes: string;
}

@Schema({ timestamps: true })
export class Itinerary {
  @Prop({
    type: Types.ObjectId,
    ref: 'Package',
    required: true,
    unique: true, // 1 itinerary per package
    index: true,
  })
  packageId: Types.ObjectId;

  @Prop({ type: [DayPlan], default: [] })
  days: DayPlan[];
}

export const ItinerarySchema = SchemaFactory.createForClass(Itinerary);