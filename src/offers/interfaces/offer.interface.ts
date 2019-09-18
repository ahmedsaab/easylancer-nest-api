import * as mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { AnyTask, Task, TaskWithCreator } from '../../tasks/interfaces/task.interface';
import { AnyUser, WorkerSummary } from '../../users/interfaces/user.interface';
import { Document, Types } from 'mongoose';
import { Modify } from '../../common/utils/types';

export interface OfferDocument extends mongoose.Document {
  workerUser: ObjectId;
  task: ObjectId;
  paymentMethod: string;
  message: string;
  price: number;
  timeToLive: number;
  notifyCreator: boolean;
}

export interface AnyOffer<
  W extends ObjectId | AnyUser = ObjectId | AnyUser,
  T extends ObjectId | AnyTask = ObjectId | AnyTask,
> extends Modify<Omit<OfferDocument, keyof Document>, {
  workerUser: W;
  task: T;
}> {
  _id: Types.ObjectId;
}

export type Offer = AnyOffer<ObjectId, ObjectId>;

export type OfferWithTaskWithCreator = AnyOffer<ObjectId, TaskWithCreator>;

export type OfferWithTask = AnyOffer<ObjectId, Task>;

export type OfferWithWorker = AnyOffer<WorkerSummary, ObjectId>;
