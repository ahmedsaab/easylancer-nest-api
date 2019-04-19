import { IsMongoId } from 'class-validator';

export class TaskSeenByUserParams {
  @IsMongoId()
  id: string;
  @IsMongoId()
  userId: string;
}
