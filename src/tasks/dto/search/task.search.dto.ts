import { TaskQueryDto } from './task.query.dto';
import { IsInt, IsOptional, IsPositive, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SearchDto } from '../../../common/dto/search.dto';

export class TaskSearchDto extends SearchDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => TaskQueryDto)
  readonly query: TaskQueryDto;
}
