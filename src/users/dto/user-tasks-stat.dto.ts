import { IsInt, IsOptional, Min } from 'class-validator';

export class UserTasksStatDto {
  @IsInt()
  @Min(0)
  @IsOptional()
  readonly created: number;
  @IsInt()
  @Min(0)
  @IsOptional()
  readonly finished: number;
}
