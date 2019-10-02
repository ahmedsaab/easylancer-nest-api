import {
  IsDefined,
  IsMongoId,
  ValidateIf,
} from 'class-validator';
import { FilterDto } from '../../../common/dto/filter.dto';

export class CreatorUserFilterDto extends FilterDto<string> {
  @ValidateIf(filter => ['eq', 'nq'].includes(filter.type))
  @IsDefined()
  @IsMongoId()
  readonly value: string;

  @ValidateIf(filter => filter.type === 'in')
  @IsDefined()
  @IsMongoId({
    each: true,
  })
  readonly values: string[];
}
