import {
  IsDefined,
  IsIn,
  ValidateIf,
} from 'class-validator';
import { TASK_STATUSES } from '../../../common/schema/constants';
import { FilterDto } from '../../../common/dto/filter.dto';
import { Filter } from '../../../common/interfaces/filter.interface';

export class StatusFilterDto extends FilterDto<string> implements Filter {
  @ValidateIf(filter => ['eq', 'nq'].includes(filter.type))
  @IsDefined()
  @IsIn(TASK_STATUSES.VALUES)
  readonly value: string;

  @ValidateIf(filter => filter.type === 'in')
  @IsDefined()
  @IsIn(TASK_STATUSES.VALUES, {
    each: true,
  })
  readonly values: string[];
}
