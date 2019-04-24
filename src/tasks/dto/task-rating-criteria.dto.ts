import { IsDefined, IsInt, IsPositive, Max, Min } from 'class-validator';

export class TaskRatingCriteriaDto {
  @IsDefined()
  @IsPositive()
  @IsInt()
  @Max(5)
  @Min(0)
  readonly measure1: number;

  @IsDefined()
  @IsPositive()
  @IsInt()
  @Max(5)
  @Min(0)
  readonly measure2: number;
}
