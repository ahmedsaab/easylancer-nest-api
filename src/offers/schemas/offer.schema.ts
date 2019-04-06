import * as mongoose from 'mongoose';
import { PAYMENT_METHODS } from '../../common/schema/constants';

const { ObjectId } = mongoose.Schema.Types;

export const OfferSchema = new mongoose.Schema({
  workerUser: {
    type: ObjectId,
    ref: 'User',
    unique: false,
    required: true,
  },
  task: {
    type: ObjectId,
    ref: 'Task',
    unique: false,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: PAYMENT_METHODS.VALUES,
    default: PAYMENT_METHODS.DEFAULT,
  },
  price: {
    type: Number,
    required: true,
    min: 10,
    default: 50,
    max: 10000,
  },
  timeToLive: {
    type: Number,
    min: 1,
    max: 30,
    required: false,
  },
  notifyCreator: {
    type: Boolean,
    required: false,
  },
});

OfferSchema.pre('validate', function(next) {
  if (this.startDateTime >= this.endDateTime) {
    next(new Error('End Date must be greater than Start Date'));
  } else {
    next();
  }
});
