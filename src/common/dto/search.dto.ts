import {
  IsInt,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';
import { Query } from '../interfaces/query.interface';

export class SearchDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly pageNo: number = 0;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(1)
  readonly pageSize: number = 20;

  readonly query: Query;
}
