import { IsEmail, IsOptional } from 'class-validator';

export class FindUserQuery {
  @IsOptional()
  @IsEmail()
  email: string;
}
