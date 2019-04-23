import { IsBoolean, IsDefined } from 'class-validator';

export class UserUpdateIsApprovedDto {
  @IsBoolean()
  @IsDefined()
  readonly isApproved: boolean;
}
