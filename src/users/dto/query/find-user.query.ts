import { IsOptional, IsString } from 'class-validator';

export class FindUserQuery {
  @IsOptional()
  @IsString()
  auth: string;
}
