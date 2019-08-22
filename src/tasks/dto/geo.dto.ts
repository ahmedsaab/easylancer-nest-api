import { IsDefined } from 'class-validator';

export class GeoDto {
  @IsDefined()
  readonly lng: number;

  @IsDefined()
  readonly lat: number;
}
