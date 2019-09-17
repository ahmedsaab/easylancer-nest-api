import { IsOptional, ValidateNested } from 'class-validator';
import { StatusFilterDto } from './status.filter.dto';
import { WorkerUserFilterDto } from './worker-user.filter.dto';
import { Type } from 'class-transformer';
import { Query } from '../../../common/interfaces/query.interface';
import { Filter } from '../../../common/interfaces/filter.interface';

export class TaskQueryDto implements Query {
  @IsOptional()
  @ValidateNested()
  @Type(() => StatusFilterDto)
  readonly status: StatusFilterDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkerUserFilterDto)
  readonly workerUser: WorkerUserFilterDto;

  [key: string]: Filter;
}
