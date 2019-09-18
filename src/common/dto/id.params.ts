import { IsDefined, IsMongoId } from 'class-validator';
import { ObjectId } from 'mongodb';

export class IdOnlyParams {
  @IsMongoId()
  @IsDefined()
  id: ObjectId;
}
