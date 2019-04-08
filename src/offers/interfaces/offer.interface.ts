import * as mongoose from 'mongoose';
import { Types } from 'mongoose';

export interface Offer extends mongoose.Document {
  workerUser: Types.ObjectId;
  task: Types.ObjectId;
  paymentMethod: string;
  price: number;
  timeToLive: number;
  notifyCreator: boolean;
}
