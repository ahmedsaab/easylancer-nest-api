import {
  IsString,
  MaxLength,
  IsOptional,
  IsIn,
  IsAlpha, IsEmail, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateSettingDto } from './settings/update.dto';

export class UpdateDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(50)
  readonly email: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @IsAlpha()
  readonly lastName: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @IsAlpha()
  readonly firstName: string;

  @IsOptional()
  @IsString()
  readonly imageUrl: string;

  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  readonly gender: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSettingDto)
  readonly settings: UpdateSettingDto;
}
