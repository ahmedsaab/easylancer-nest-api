import { IsDefined, IsString } from 'class-validator';

export class UserCreateBadgeDto {
  @IsDefined()
  @IsString()
  readonly name: string;
}
