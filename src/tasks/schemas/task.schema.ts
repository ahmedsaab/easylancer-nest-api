import * as mongoose from 'mongoose';
import { LocationSchema } from './location.schema';
import { TaskRatingSchema } from './task-rating.schema';
import { BadRequestException } from '@nestjs/common';
import { PAYMENT_METHODS, TASK_CATEGORIES, TASK_STATUSES, TASK_TYPES } from '../../common/schema/constants';
import { Task } from '../interfaces/task.interface';
import { OffersCollectionName } from '../../offers/schemas/offer.schema';
import { UsersCollectionName } from '../../users/schemas/user.schema';

const { ObjectId } = mongoose.Schema.Types;

export const TasksCollectionName = 'tasks';

export const TaskSchemaDefinition = {
  creatorUser: {
    type: ObjectId,
    ref: 'User',
    unique: false,
    required: true,
    schema: UsersCollectionName,
  },
  workerUser: {
    type: ObjectId,
    ref: 'User',
    unique: false,
    default: null,
    schema: UsersCollectionName,
  },
  acceptedOffer: {
    type: ObjectId,
    ref: 'Offer',
    schema: OffersCollectionName,
    index: {
      unique: true,
      partialFilterExpression: {
        acceptedOffer: {
          $type: 'string',
        },
      },
    },
    default: null,
  },
  price: {
    type: Number,
    required: true,
    min: 10,
    default: 50,
    max: 10000,
  },
  title: {
    type: String,
    required: true,
    maxlength: 80,
  },
  description: {
    type: String,
    required: true,
    maxlength: 400,
  },
  seenBy: {
    type: [ObjectId],
    default: [],
  },
  location: {
    type: LocationSchema,
    required: true,
  },
  startDateTime: {
    type: Date,
    required: true,
  },
  endDateTime: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    set: (val) => this.createdAt ?
      this.createdAt : val,
  },
  creatorRating: {
    type: TaskRatingSchema,
    default: null,
  },
  workerRating: {
    type: TaskRatingSchema,
    default: null,
  },
  status: {
    type: String,
    enum: TASK_STATUSES.VALUES,
    default: TASK_STATUSES.DEFAULT,
  },
  type: {
    type: String,
    enum: TASK_TYPES.VALUES,
    required: true,
  },
  category: {
    type: String,
    enum: TASK_CATEGORIES.VALUES,
    required: true,
  },
  tags: [String],
  paymentMethod: {
    type: String,
    enum: PAYMENT_METHODS.VALUES,
    default: PAYMENT_METHODS.DEFAULT,
  },
  imagesUrls: [String],
};

export const TaskSchema = new mongoose.Schema(
  TaskSchemaDefinition, {
    versionKey: false,
    collection: TasksCollectionName,
  },
);

TaskSchema.pre<Task>('validate', function(next) {
  if (this.endDateTime && this.startDateTime >= this.endDateTime) {
    next(new BadRequestException('End Date must be greater than Start Date'));
  } else if (this.creatorUser.equals(this.workerUser)) {
    next(new BadRequestException('Creator user cannot equal Worker user'));
  } else {
    next();
  }
});
