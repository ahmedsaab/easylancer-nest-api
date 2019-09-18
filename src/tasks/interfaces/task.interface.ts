import { Document, Types } from 'mongoose';
import { TaskRating } from './task-rating.interface';
import { Location } from './location.interface';
import { Offer } from '../../offers/interfaces/offer.interface';

import { ObjectId } from 'mongodb';
import { UserSummary, WorkerSummary } from '../../users/interfaces/user.interface';
import { Modify } from '../../common/utils/types';

const TASK_SUMMARY_KEYS = [
  '_id', 'startDateTime', 'endDateTime', 'creatorUser', 'workerUser',
  'price', 'title', 'acceptedOffer', 'description', 'seenBy', 'location',
  'tags', 'createdAt', 'creatorRating', 'workerRating', 'status', 'type',
  'category', 'paymentMethod', 'imagesUrls',
];

export const TASK_SUMMARY_PROP = TASK_SUMMARY_KEYS.join(' ');

export interface TaskDocument extends Document {
  startDateTime: Date;
  endDateTime: Date;
  creatorUser: ObjectId;
  workerUser: ObjectId;
  acceptedOffer: ObjectId;
  price: number;
  title: string;
  description: string;
  seenBy: [Types.ObjectId];
  location: Location;
  tags: [string];
  createdAt: Date;
  creatorRating: TaskRating;
  workerRating: TaskRating;
  status: string;
  type: string;
  category: string;
  paymentMethod: string;
  imagesUrls: string[];
}

export interface AnyTask<
  C extends ObjectId | UserSummary = ObjectId | UserSummary,
  W extends ObjectId | WorkerSummary = ObjectId | WorkerSummary,
  A extends ObjectId | Offer = ObjectId | Offer
> extends Modify<Omit<TaskDocument, keyof Document>, {
  creatorUser: C;
  workerUser: W;
  acceptedOffer: A;
}> {
  _id: ObjectId;
}

export type TaskWithCreator = AnyTask<UserSummary, ObjectId, ObjectId>;

export type TaskWithWorker = AnyTask<ObjectId, WorkerSummary, ObjectId>;

export type TaskView = AnyTask<UserSummary, WorkerSummary, ObjectId>;

export type Task = AnyTask<ObjectId, ObjectId, ObjectId>;

export interface MyCreatedTask extends TaskWithWorker {
  offers?: number;
}

export interface MyAppliedTask extends TaskWithCreator {
  offer: Offer;
}

export interface TaskOfferCount {
  _id: ObjectId;
  count: number;
}
