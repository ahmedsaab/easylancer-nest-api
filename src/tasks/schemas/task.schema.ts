import * as mongoose from 'mongoose';
import { LocationSchema } from './location.schema';
import { TaskRatingSchema } from './task-rating.schema';
import { BadRequestException } from '@nestjs/common';

const { ObjectId } = mongoose.Schema.Types;

export const TASK_TYPES = ['type1', 'type2', 'type3', 'type4'];
export const TASK_STATUSES = ['active', 'in-progress', 'done', 'canceled'];
export const TASK_CATEGORIES = ['category1', 'category2', 'category3', 'category4'];
export const TASK_PAYMENTS = ['card', 'cash'];

export const TaskSchema = new mongoose.Schema({
  creatorUser: {
    type: ObjectId,
    ref: 'User',
    unique: false,
    required: true,
  },
  workerUser: {
    type: ObjectId,
    ref: 'User',
    unique: false,
    default: null,
  },
  acceptedOffer: {
    type: ObjectId,
    ref: 'Offer',
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
    maxlength: 40,
  },
  description: {
    type: String,
    required: true,
    maxlength: 400,
  },
  seenCount: {
    type: Number,
    required: true,
    validate: Number.isInteger,
    min: 0,
    default: 0,
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
    enum: TASK_STATUSES,
    default: TASK_STATUSES[0],
  },
  type: {
    type: String,
    enum: TASK_TYPES,
    required: true,
  },
  category: {
    type: String,
    enum: TASK_CATEGORIES,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: TASK_PAYMENTS,
    default: TASK_PAYMENTS[0],
  },
  imagesUrls: [String],
});

TaskSchema.pre('validate', function(next) {
  if (this.startDateTime >= this.endDateTime) {
    next(new BadRequestException('End Date must be greater than Start Date'));
  } else if (this.creatorUser.equals(this.workerUser)) {
    next(new BadRequestException('Creator user cannot equal Worker user'));
  } else {
    next();
  }
});
