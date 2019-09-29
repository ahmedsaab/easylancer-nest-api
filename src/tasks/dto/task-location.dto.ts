import { IsDefined, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GeoDto } from './geo.dto';

export class TaskLocationDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => GeoDto)
  readonly geo: GeoDto;

  @IsDefined()
  @IsString()
  readonly address: string;

  @IsDefined()
  @IsString()
  readonly city: string;

  @IsDefined()
  @IsString()
  readonly country: string;
}
