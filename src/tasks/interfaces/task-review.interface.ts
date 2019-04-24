import { TaskRating } from './task-rating.interface';
import { Types } from 'mongoose';

export interface TaskReview extends Partial<TaskRating> {
  creatorUser: Types.ObjectId;
}
