import { IsString, IsInt } from 'class-validator';

export class UpdateUserDto {
  @IsInt()
  readonly id: number;

  @IsString()
  readonly name: string;

  @IsInt()
  readonly age: number;

  @IsString()
  readonly breed: string;
}
