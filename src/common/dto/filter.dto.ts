import {
  IsDefined,
  IsIn,
} from 'class-validator';

export class FilterDto<T extends string | number> {
  @IsDefined()
  @IsIn(['eq', 'nq', 'in'])
  readonly type: string;

  readonly value: T;

  readonly values: T[];
}
