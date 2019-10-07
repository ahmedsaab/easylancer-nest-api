import {
  IsString,
  MaxLength,
  IsIn,
  IsAlpha,
  ValidateNested,
  IsBoolean,
  IsDateString,
  IsDefined,
  ValidateIf, IsOptional, IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserUpdateSettingDto } from './user.update.settings.dto';
import { LANGUAGES } from '../../common/schema/constants';
import { UserLocationDto } from './user-location.dto';

export class UserUpdateDto {
  @ValidateIf(o => o.lastName !== undefined)
  @IsDefined()
  @IsString()
  @MaxLength(30)
  @IsAlpha()
  readonly lastName?: string;

  @ValidateIf(o => o.city !== undefined)
  @IsDefined()
  @IsString()
  @MaxLength(30)
  @IsAlpha()
  readonly city?: string;

  @ValidateIf(o => o.phoneNumber !== undefined)
  @IsDefined()
  @IsString()
  readonly phoneNumber?: string;

  @ValidateIf(o => o.birthDate !== undefined)
  @IsDefined()
  @IsDateString()
  readonly birthDate?: Date;

  @ValidateIf(o => o.about !== undefined)
  @IsDefined()
  @IsString()
  @MaxLength(400)
  readonly about?: string;

  @ValidateIf(o => o.isApproved !== undefined)
  @IsDefined()
  @IsBoolean()
  readonly isApproved?: boolean;

  @ValidateIf(o => o.firstName !== undefined)
  @IsDefined()
  @IsString()
  @MaxLength(30)
  @IsAlpha()
  readonly firstName?: string;

  @ValidateIf(o => o.imageUrl !== undefined)
  @IsDefined()
  @IsString()
  readonly imageUrl?: string;

  @ValidateIf(o => o.imagesUrls !== undefined)
  @IsArray()
  @IsDefined()
  @IsString({each: true})
  readonly imagesUrls?: [string];

  @IsOptional()
  @IsArray()
  @IsString({each: true})
  @IsIn(LANGUAGES.VALUES, {
    each: true,
  })
  readonly languages?: [string];

  @IsOptional()
  @ValidateNested()
  @Type(() => UserLocationDto)
  readonly location?: UserLocationDto;

  @ValidateIf(o => o.gender !== undefined)
  @IsDefined()
  @IsIn(['male', 'female', 'other'])
  readonly gender?: string;

  @ValidateIf(o => o.settings !== undefined)
  @IsDefined()
  @ValidateNested()
  @Type(() => UserUpdateSettingDto)
  readonly settings?: UserUpdateSettingDto;
}
