import * as mongoose from 'mongoose';
import { LocationSchema } from './location.schema';
import { RatingSchema } from '../../common/schema/rating.schema';

export const TaskSchema = new mongoose.Schema({
  creatorUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: false,
    required: true,
  },
  acceptedOffer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    unique: true,
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
    set: (val) => this.createdAt ? this.createdAt : val,
  },
  creatorRating: {
    type: RatingSchema,
    default: null,
  },
  status: {
    type: String,
    enum: ['active', 'in-progress', 'done', 'canceled'],
    default: 'active',
  },
  type: {
    type: String,
    enum: ['type1', 'type2', 'type3', 'type4'],
    required: true,
  },
  category: {
    type: String,
    enum: ['category1', 'category2', 'category3', 'category4'],
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash'],
    default: 'card',
  },
  imagesUrls: [String],
});

TaskSchema.pre('validate', function(next) {
  if (this.startDateTime >= this.endDateTime) {
    next(new Error('End Date must be greater than Start Date'));
  } else {
    next();
  }
});
