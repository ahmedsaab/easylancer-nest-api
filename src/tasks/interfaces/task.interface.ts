import { Document, Types } from 'mongoose';
import { TaskRating } from './task-rating.interface';
import { Location } from './location.interface';

export interface Task extends Document {
  startDateTime: Date;
  endDateTime: Date;
  creatorUser: Types.ObjectId;
  workerUser: Types.ObjectId;
  acceptedOffer: Types.ObjectId;
  price: number;
  title: string;
  description: string;
  seenCount: number;
  location: Location;
  createdAt: Date;
  creatorRating: TaskRating;
  workerRating: TaskRating;
  status: string;
  type: string;
  category: string;
  paymentMethod: string;
  imagesUrls: string[];
}
