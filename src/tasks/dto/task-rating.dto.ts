import { IsBoolean, IsDefined, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskRatingCriteriaDto } from './task-rating-criteria.dto';

export class TaskRatingDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => TaskRatingCriteriaDto)
  readonly criteria: TaskRatingCriteriaDto;

  @IsDefined()
  @IsBoolean()
  readonly like: boolean;

  @IsDefined()
  @MaxLength(250)
  readonly description: string;
}
