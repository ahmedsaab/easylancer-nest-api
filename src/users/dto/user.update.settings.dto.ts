import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class UserUpdateSettingDto {
  @IsInt()
  @Max(5)
  @IsOptional()
  readonly setting1: number;

  @IsInt()
  @Min(0)
  @Max(5)
  @IsOptional()
  readonly setting2: number;
}
