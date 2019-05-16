import { IsDefined, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

// TODO: IsEmail bug with noha@gmail.com

export class UserCreateDto {
  @IsDefined()
  @IsEmail()
  @MaxLength(50)
  readonly email: string;
  @IsOptional()
  @IsString()
  @MaxLength(30)
  readonly firstName: string;
  @IsOptional()
  @IsString()
  @MaxLength(30)
  readonly lastName: string;
  @IsDefined()
  @IsString()
  readonly password: string;
}
