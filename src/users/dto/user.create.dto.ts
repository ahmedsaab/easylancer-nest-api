import { IsDefined, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

// TODO: IsEmail bug with noha@gmail.com

export class UserCreateDto {
  @IsDefined()
  @IsString()
  readonly auth: string;
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  readonly firstName: string;
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  readonly lastName: string;
}
