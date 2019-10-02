import * as mongoose from 'mongoose';

export const ProfileRatingSchema = new mongoose.Schema({
  likes: {
    type: Number,
    min: 0,
    validate : Number.isInteger,
    default: 0,
  },
  dislikes: {
    type: Number,
    min: 0,
    validate : Number.isInteger,
    default: 0,
  },
  value: {
    type: Number,
    min: 0,
    validate : Number.isInteger,
    default: 0,
  },
  count: {
    type: Number,
    min: 0,
    validate : Number.isInteger,
    default: 0,
  },
}, { _id : false });

export const UserRatingsSchema = new mongoose.Schema({
  creator: {
    type: ProfileRatingSchema,
    default: {},
  },
  worker: {
    type: ProfileRatingSchema,
    default: {},
  },
}, { _id : false });
