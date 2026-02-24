import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { QueryStatus } from 'src/enum/query.enum';

export type QueryDocument = Query & Document;

@Schema({ timestamps: true })
export class Query {
  // ---------------------------
  // 👤 User Information
  // ---------------------------

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  service: string; // ex: "GST Registration", "ITR Filing"

  @Prop({ required: true })
  message: string;

  // ---------------------------
  // 📊 Business / Admin Meta
  // ---------------------------

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