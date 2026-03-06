import { Prop } from '@nestjs/mongoose';

export class ImageItem {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  url: string;

  @Prop()
  size: number;
}
