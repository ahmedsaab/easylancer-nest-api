import { IsDefined, IsEmail, MaxLength } from 'class-validator';

export class CreateDto {
  @IsDefined()
  @IsEmail()
  @MaxLength(50)
  readonly email: string;
}
