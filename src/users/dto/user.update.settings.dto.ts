import { IsIn, IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';
import { USER_SETTINGS_ROLES } from '../../common/schema/constants';

export class UserUpdateSettingDto {
  @IsIn(USER_SETTINGS_ROLES.VALUES)
  @IsOptional()
  readonly role: string;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @Max(5)
  @IsOptional()
  readonly setting2: number;
}
