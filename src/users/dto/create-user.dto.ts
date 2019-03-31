import * as Joi from 'joi';
import { IsInt, IsString } from 'class-validator';

export class CreateUserDto {
  @IsInt()
  readonly id: number;

  @IsString()
  readonly name: string;

  @IsInt()
  readonly age: number;

  @IsString()
  readonly breed: string;
}

export const createUserSchema = Joi.object().keys({
  id: Joi.number().required(),
  name: Joi.string().alphanum().min(3).max(30).required(),
  age: Joi.string().alphanum(),
  breed: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
});
