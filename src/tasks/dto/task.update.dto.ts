import { IsString, IsOptional, ValidateNested, IsIn, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { LocationDto } from './location.dto';
import { PAYMENT_METHODS } from '../../common/schema/constants';

export class TaskUpdateDto {
  @IsOptional()
  @IsString()
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
  @Type(() => LocationDto)
  readonly location: LocationDto;
}
