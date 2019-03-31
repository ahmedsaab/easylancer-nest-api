import { IsAlphanumeric, IsDefined, IsString } from 'class-validator';

export class CreateUserDto {
  @IsDefined()
  @IsString()
  @IsAlphanumeric()
  readonly name: string;
}
