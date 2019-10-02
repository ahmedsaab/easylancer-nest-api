import { Document, Types } from 'mongoose';
import { Badge } from './bade.interface';
import { UserRatings } from './user-ratings.interface';
import { Setting } from './setting.interface';
import { Tag } from './tag.interface';
import { UserLocation } from './user-location.interface';

const GENERAL_USER_SUMMARY_KEYS = [
  '_id', 'firstName', 'lastName', 'ratings',
  'imageUrl', 'badges', 'isApproved',
];

const WORKER_USER_SUMMARY_KEYS = GENERAL_USER_SUMMARY_KEYS.concat(['tags']);

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
  imagesUrls: string[];
  languages: string[];
  location: UserLocation;
  password: string;
  isApproved: boolean;
  createdAt: Date;
  gender: string;
  badges: Badge[];
  tags: Tag[];
  ratings: UserRatings;
  settings: Setting;
}

export interface User extends Omit<UserDocument, keyof Document> {
  _id: Types.ObjectId;
}

export type UserSummary = Pick<User, '_id' | 'firstName' | 'lastName' |
  'ratings' | 'imageUrl' | 'badges' | 'isApproved'>;

export type WorkerSummary = UserSummary &
  Pick<User, 'tags'>;

export type AnyUser = User | UserSummary | WorkerSummary;
