import { IsDefined } from 'class-validator';

export class LocationDto {
  @IsDefined()
  readonly lng: number;

  @IsDefined()
  readonly lat: number;
}
