import { IsEnum } from 'class-validator';
import { QueryStatus } from 'src/enum/query.enum';

export class UpdateStatusDto {
  @IsEnum(QueryStatus)
  status: QueryStatus;
}