import { IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';

export class UserUpdateSettingDto {
  @IsInt()
  @IsNotEmpty()
  @Max(5)
  @IsOptional()
  readonly setting1: number;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @Max(5)
  @IsOptional()
  readonly setting2: number;
}
