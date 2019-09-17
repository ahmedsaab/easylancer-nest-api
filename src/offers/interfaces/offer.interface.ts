import * as mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { Task, TaskDto } from '../../tasks/interfaces/task.interface';
import { User } from '../../users/interfaces/user.interface';
import { Document, Types } from 'mongoose';

export interface Offer<
  T extends ObjectId | TaskDto,
  U extends ObjectId | Omit<User, keyof Document>
> extends mongoose.Document {
  workerUser: U;
  task: T;
  paymentMethod: string;
  message: string;
  price: number;
  timeToLive: number;
  notifyCreator: boolean;
}

export interface OfferDto<
  T extends ObjectId | TaskDto,
  U extends ObjectId | Omit<User, keyof Document>
> extends Omit<Offer<T, U>, keyof Document> {
  _id: Types.ObjectId;
}
