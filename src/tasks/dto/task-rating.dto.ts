import { IsBoolean, IsDefined, IsInt, IsPositive, Max, MaxLength, Min } from 'class-validator';

export class TaskRatingDto {
  @IsDefined()
  @IsInt()
  @Max(5)
  @Min(0)
  readonly rating: number;

  @IsDefined()
  @IsBoolean()
  readonly like: boolean;

  @IsDefined()
  @MaxLength(250)
  readonly description: string;
}
