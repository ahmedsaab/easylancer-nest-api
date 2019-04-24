import { IsDefined, IsIn, IsMongoId } from 'class-validator';
import { TASK_STATUSES } from '../../../common/schema/constants';

export class TaskStatusParams {
  @IsDefined()
  @IsMongoId()
  id: string;
  @IsDefined()
  @IsIn(TASK_STATUSES.VALUES)
  status: string;
}
