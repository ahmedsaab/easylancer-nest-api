import {
  IsString,
  MaxLength,
  IsBoolean,
  IsOptional,
  IsIn,
  IsAlpha, IsEmail,
} from 'class-validator';

export class UpdateDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(50)
  readonly email: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @IsAlpha()
  readonly lastName: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @IsAlpha()
  readonly firstName: string;

  @IsOptional()
  @IsString()
  readonly imageUrl: string;

  @IsOptional()
  @IsBoolean()
  readonly isApproved: number;

  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  readonly gender: number;
}
