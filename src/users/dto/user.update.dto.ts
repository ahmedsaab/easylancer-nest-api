import {
  IsString,
  MaxLength,
  IsOptional,
  IsIn,
  IsAlpha,
  ValidateNested,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserUpdateSettingDto } from './user.update.settings.dto';

export class UserUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @IsAlpha()
  readonly lastName: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @IsAlpha()
  readonly city: string;

  @IsOptional()
  @IsString()
  readonly phoneNumber: string;

  @IsOptional()
  @IsDateString()
  readonly birthDate: Date;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  readonly about: string;

  @IsOptional()
  @IsBoolean()
  readonly isApproved: boolean;

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
  @Type(() => UserUpdateSettingDto)
  readonly settings: UserUpdateSettingDto;
}
