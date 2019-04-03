import * as mongoose from 'mongoose';

export const RatingSchema = new mongoose.Schema({
  measure1: {
    type: Number,
    min: 0,
    max: 5,
    validate : Number.isInteger,
    default: 0,
  },
  measure2: {
    type: Number,
    min: 0,
    max: 5,
    validate : Number.isInteger,
    default: 0,
  },
}, { _id : false });
