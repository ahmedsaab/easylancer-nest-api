import { Document, Types } from 'mongoose';
import { Badge } from './bade.interface';
import { UserRating } from './user-rating.interface';
import { Setting } from './setting.interface';

// TODO: Change type of lastSeen to Date
export interface User extends Document {
  name: string;
  age: number;
  breed: string;
  email: string;
  createdTasks: Types.ObjectId[];
  acceptedTasks: Types.ObjectId[];
  appliedTasks: Types.ObjectId[];
  finishedTasks: Types.ObjectId[];
  lastName: string;
  lastSeen: string;
  firstName: string;
  imageUrl: string;
  dislikes: number;
  likes: number;
  isApproved: boolean;
  createdAt: Date;
  gender: string;
  badges: Badge[];
  ratings: UserRating;
  settings: Setting;
}
