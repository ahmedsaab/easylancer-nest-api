import { IsMongoId } from 'class-validator';
import { ObjectId } from 'mongodb';

export class TaskSeenByUserParams {
  @IsMongoId()
  id: ObjectId;
  @IsMongoId()
  userId: ObjectId;
}
