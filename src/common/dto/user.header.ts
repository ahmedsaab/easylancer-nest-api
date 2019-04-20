import { IsMongoId } from 'class-validator';

export class UserHeader {
  @IsMongoId()
  id: string;
}
