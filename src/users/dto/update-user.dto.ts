import {
  IsString,
  IsInt,
  MaxLength,
  ValidateNested,
  IsBoolean,
  IsOptional,
  IsAlphanumeric,
  IsIn,
  IsArray,
  Min,
  IsAlpha,
} from 'class-validator';
import { UserTasksStatDto } from './user-tasks-stat.dto';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @IsAlphanumeric()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  readonly name: string;

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
  @IsInt()
  @Min(0)
  readonly dislikes: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  readonly likes: number;

  @IsOptional()
  @IsBoolean()
  readonly isApproved: number;

  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  readonly gender: number;

  @IsOptional()
  @IsArray()
  @MaxLength(20, {
    each: true,
  })
  readonly badges: [];

  // @ValidateNested({ each: true })
  // @IsNonPrimitiveArray()
  // @Type(() => PositionDto)
  // positions: PositionDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => UserTasksStatDto)
  readonly tasks: UserTasksStatDto;
}

// import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
//
// export function IsNonPrimitiveArray(validationOptions?: ValidationOptions) {
//   return (object: any, propertyName: string) => {
//     registerDecorator({
//       name: 'IsNonPrimitiveArray',
//       target: object.constructor,
//       propertyName,
//       constraints: [],
//       options: validationOptions,
//       validator: {
//         validate(value: any, args: ValidationArguments) {
//           return Array.isArray(value) && value.reduce((a, b) => a && typeof b === 'object' && !Array.isArray(b), true);
//         },
//       },
//     });
//   };
// }
