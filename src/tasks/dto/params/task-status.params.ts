import { IsMongoId } from 'class-validator';

export class TaskStatusParams {
  @IsMongoId()
  id: string;
  @IsMongoId()
  status: string;
}
