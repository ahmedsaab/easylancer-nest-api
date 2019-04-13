import { IsDefined, IsString } from 'class-validator';

export class CreateBadgeDto {
  @IsDefined()
  @IsString()
  readonly name: string;
}
