import { TaskRating } from './task-rating.interface';
import { Types } from 'mongoose';

export interface TaskReview extends TaskRating {
  creatorUser: Types.ObjectId;
}
