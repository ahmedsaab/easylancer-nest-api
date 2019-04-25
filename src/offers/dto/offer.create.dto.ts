import {
  IsBoolean,
  IsDefined,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsPositive, IsString,
} from 'class-validator';
import { PAYMENT_METHODS } from '../../common/schema/constants';

export class OfferCreateDto {
  @IsMongoId()
  @IsDefined()
  readonly workerUser: string;

  @IsOptional()
  @IsIn(PAYMENT_METHODS.VALUES)
  readonly paymentMethod: string;

  @IsOptional()
  @IsPositive()
  @IsInt()
  readonly timeToLive: number;

  @IsOptional()
  @IsBoolean()
  readonly notifyCreator: boolean;

  @IsDefined()
  @IsPositive()
  @IsInt()
  readonly price: number;

  @IsDefined()
  @IsString()
  readonly message: string;

  @IsDefined()
  @IsMongoId()
  task: string;
}
