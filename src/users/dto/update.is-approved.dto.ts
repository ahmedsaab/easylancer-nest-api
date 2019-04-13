import { IsBoolean, IsDefined } from 'class-validator';

export class UpdateIsApprovedDto {
  @IsBoolean()
  @IsDefined()
  readonly isApproved: boolean;
}
