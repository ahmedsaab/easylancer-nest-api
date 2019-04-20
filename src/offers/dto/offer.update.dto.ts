import {
  IsBoolean,
  IsOptional,
  IsIn,
  IsDefined, IsPositive, IsInt, IsString,
} from 'class-validator';
import { PAYMENT_METHODS } from '../../common/schema/constants';

export class OfferUpdateDto {
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

  @IsOptional()
  @IsPositive()
  @IsInt()
  readonly price: number;

  @IsOptional()
  @IsString()
  readonly message: string;
}
