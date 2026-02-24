import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QueryService } from './query.service';
import { QueryController } from './query.controller';
import { Query, QuerySchema } from './schema/query-schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Query.name, schema: QuerySchema }]),
  ],
  controllers: [QueryController],
  providers: [QueryService],
})
export class QueryModule {}