import { TaskRating } from './task-rating.interface';
import { Types } from 'mongoose';

export interface TaskReview extends Omit<TaskRating, keyof Document> {
  creatorUser: Types.ObjectId;
}
