import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';
import { Document, Types } from 'mongoose';
import { QueryStatus } from 'src/enum/query.enum';

export type QueryDocument = Query & Document;

/**
 * Mongoose schema representing a user inquiry or booking lead.
 * Stores customer contact details and administrative lifecycle status.
 */
@Schema({ timestamps: true })
export class Query {
  /**
   * User Information Section
   */

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: false })
  service?: string; // ex: "GST Registration", "ITR Filing"

  @Prop({ required: false })
  message?: string;

  @IsOptional()
  @Prop({ type: Types.ObjectId, ref: 'Package' })
  packageId?: Types.ObjectId;

  /**
   * Business & Admin Metadata Section
   */

  @Prop({
    type: String,
    enum: QueryStatus,
    default: QueryStatus.NEW
  })
  status: QueryStatus;

  @Prop()
  notes: string; // internal admin notes
}

export const QuerySchema = SchemaFactory.createForClass(Query);