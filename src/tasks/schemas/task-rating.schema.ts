import * as mongoose from 'mongoose';

export const TaskRatingSchema = new mongoose.Schema({
  createdAt: {
    default: new Date(),
    set() { return this.createdAt; },
    type: Date,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    validate : Number.isInteger,
    default: 0,
    required: true,
  },
  description: {
    type: String,
    required: true,
    maxlength: 250,
  },
  like: {
    type: Boolean,
    required: true,
  },
}, { _id : false });
