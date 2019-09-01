import {
  IsString,
  IsOptional,
  ValidateNested,
  IsIn,
  IsDateString,
  IsPositive,
  IsInt,
  IsDefined,
  IsMongoId,
  IsArray,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LocationDto } from './location.dto';
import { PAYMENT_METHODS, TASK_STATUSES } from '../../common/schema/constants';
import { TaskRatingDto } from './task-rating.dto';

export class TaskUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  readonly title: string;

  @IsOptional()
  @IsDateString()
  readonly startDateTime: Date;

  @IsOptional()
  @IsIn(PAYMENT_METHODS.VALUES)
  readonly paymentMethod: string;

  @IsOptional()
  @IsString()
  readonly description: string;

  @IsOptional()
  @IsDateString()
  readonly endDateTime: Date;

  @IsOptional()
  @ValidateNested()
  @Type(() => TaskRatingDto)
  readonly creatorRating: TaskRatingDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TaskRatingDto)
  readonly workerRating: TaskRatingDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  readonly location: LocationDto;

  @IsOptional()
  @IsPositive()
  @IsInt()
  readonly price: number;

  @IsOptional()
  @IsMongoId()
  acceptedOffer: string;

  @IsOptional()
  @IsIn(TASK_STATUSES.VALUES)
  status: string;

  @IsOptional()
  @IsArray()
  @IsString({each: true})
  readonly imagesUrls: [string];

  @IsOptional()
  @IsArray()
  @IsString({each: true})
  readonly tags: [string];
}
