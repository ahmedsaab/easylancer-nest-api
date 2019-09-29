import { IsDefined, IsString } from 'class-validator';

export class UserLocationDto {
  @IsDefined()
  @IsString()
  readonly city: string;

  @IsDefined()
  @IsString()
  readonly country: string;
}
