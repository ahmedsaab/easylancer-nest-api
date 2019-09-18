import { Document, Types } from 'mongoose';
import { Badge } from './bade.interface';
import { UserRating } from './user-rating.interface';
import { Setting } from './setting.interface';
import { Tag } from './tag.interface';

const GENERAL_USER_SUMMARY_KEYS = [
  '_id', 'firstName', 'lastName', 'likes', 'dislikes',
  'imageUrl', 'badges', 'isApproved',
];

const WORKER_USER_SUMMARY_KEYS = GENERAL_USER_SUMMARY_KEYS.concat([
  'tags',
  'ratings',
]);

export const GENERAL_USER_SUMMARY_PROP =
  GENERAL_USER_SUMMARY_KEYS.join(' ');

export const WORKER_USER_SUMMARY_PROP =
  WORKER_USER_SUMMARY_KEYS.join(' ');

// TODO: Change type of lastSeen to Date
export interface UserDocument extends Document {
  auth: string;
  createdTasks: Types.ObjectId[];
  acceptedTasks: Types.ObjectId[];
  appliedTasks: Types.ObjectId[];
  finishedTasks: Types.ObjectId[];
  lastName: string;
  lastSeen: string;
  firstName: string;
  imageUrl: string;
  password: string;
  dislikes: number;
  likes: number;
  isApproved: boolean;
  createdAt: Date;
  gender: string;
  badges: Badge[];
  tags: Tag[];
  ratings: UserRating;
  settings: Setting;
}

export interface User extends Omit<UserDocument, keyof Document> {
  _id: Types.ObjectId;
}

export type UserSummary = Pick<User,
  '_id' | 'firstName' | 'lastName' | 'likes' | 'dislikes' |
  'imageUrl' | 'badges' | 'isApproved'
  >;

export type WorkerSummary = UserSummary &
  Pick<User, 'tags' | 'ratings'>;

export type AnyUser = User;
