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
    required: false,
    type: String,
    enum: PAYMENT_METHODS.VALUES,
    default: PAYMENT_METHODS.DEFAULT,
  },
  message: {
    required: true,
    type: String,
    maxlength: 300,
  },
  price: {
    type: Number,
    required: true,
    min: 10,
    max: 10000,
  },
  timeToLive: {
    type: Number,
    min: 1,
    max: 30,
    required: false,
    default: null,
  },
  notifyCreator: {
    type: Boolean,
    required: false,
    default: false,
  },
}, { versionKey: false });

OfferSchema.index({
  workerUser: 1,
  task: 1,
}, {
  unique: true,
});
