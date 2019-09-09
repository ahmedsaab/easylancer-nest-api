import * as mongoose from 'mongoose';

export const UserRatingSchema = new mongoose.Schema({
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
