import { IsIn, IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';
import { USER_SETTINGS_ROLES } from '../../common/schema/constants';

export class UserUpdateSettingDto {
  @IsIn(USER_SETTINGS_ROLES.VALUES)
  @IsOptional()
  readonly role: string;
}
