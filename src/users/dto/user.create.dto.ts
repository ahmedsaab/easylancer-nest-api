import { IsDefined, IsEmail, MaxLength } from 'class-validator';

// TODO: IsEmail bug with noha@gmail.com

export class UserCreateDto {
  @IsDefined()
  @IsEmail()
  @MaxLength(50)
  readonly email: string;
}
