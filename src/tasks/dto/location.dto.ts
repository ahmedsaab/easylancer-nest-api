import { IsDefined, IsPositive } from 'class-validator';

export class LocationDto {
  @IsPositive()
  @IsDefined()
  readonly lon: number;

  @IsPositive()
  @IsDefined()
  readonly lat: number;
}
