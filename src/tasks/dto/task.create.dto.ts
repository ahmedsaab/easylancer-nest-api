import {
  IsArray,
  IsDateString,
  IsDefined,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ObjectId } from 'mongodb';
import { PAYMENT_METHODS, TASK_CATEGORIES, TASK_TYPES } from '../../common/schema/constants';
import { LocationDto } from './location.dto';

export class TaskCreateDto {
  @IsDefined()
  @IsIn(TASK_CATEGORIES.VALUES)
  readonly category: string;

  @IsDefined()
  @IsIn(TASK_TYPES.VALUES)
  readonly type: string;

  @IsOptional()
  @IsIn(PAYMENT_METHODS.VALUES)
  readonly paymentMethod: string;

  @IsDefined()
  @IsString()
  readonly creatorUser: ObjectId;

  @IsDefined()
  @IsString()
  readonly description: string;

  @IsDefined()
  @IsString()
  @MaxLength(80)
  readonly title: string;

  @IsDefined()
  @IsPositive()
  @IsInt()
  readonly price: number;

  @IsDefined()
  @IsDateString()
  readonly startDateTime: Date;

  @IsOptional()
  @IsArray()
  @IsString({each: true})
  readonly imagesUrls: [string];

  @IsOptional()
  @IsArray()
  @IsString({each: true})
  readonly tags: [string];

  @IsOptional()
  @IsDateString()
  readonly endDateTime: Date;

  @IsDefined()
  @ValidateNested()
  @Type(() => LocationDto)
  readonly location: LocationDto;
}
