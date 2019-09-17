import { Document, Types } from 'mongoose';
import { TaskRating } from './task-rating.interface';
import { Location } from './location.interface';
import { Offer, OfferDto } from '../../offers/interfaces/offer.interface';

import { ObjectId } from 'mongodb';

export interface Task extends Document {
  startDateTime: Date;
  endDateTime: Date;
  creatorUser: Types.ObjectId;
  workerUser: Types.ObjectId;
  acceptedOffer: Types.ObjectId;
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

export interface TaskDto extends Omit<Task, keyof Document> {
  _id: Types.ObjectId;
}

export interface MyCreatedTask extends TaskDto {
  offers?: number;
}

export interface MyAppliedTask extends TaskDto {
  offer: OfferDto<ObjectId, ObjectId>;
}
