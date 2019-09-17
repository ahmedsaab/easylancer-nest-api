import * as mongoose from 'mongoose';
import { PAYMENT_METHODS } from '../../common/schema/constants';
import { UsersCollectionName } from '../../users/schemas/user.schema';
import { TasksCollectionName } from '../../tasks/schemas/task.schema';

const { ObjectId } = mongoose.Schema.Types;

export const OffersCollectionName = 'offers';

export const OfferSchemaDefinition = {
  workerUser: {
    type: ObjectId,
    ref: 'User',
    unique: false,
    required: true,
    schema: UsersCollectionName,
  },
  task: {
    type: ObjectId,
    ref: 'Task',
    unique: false,
    required: true,
    schema: TasksCollectionName,
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
};

export const OfferSchema = new mongoose.Schema(
  OfferSchemaDefinition, {
    versionKey: false,
    collection: OffersCollectionName,
  },
);

OfferSchema.index({
  workerUser: 1,
  task: 1,
}, {
  unique: true,
});
