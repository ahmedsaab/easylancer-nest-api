import * as mongoose from 'mongoose';

export const TaskRatingSchema = new mongoose.Schema({
  criteria: {
    type: {
      measure1: {
        type: Number,
        min: 0,
        max: 5,
        validate : Number.isInteger,
        default: 0,
        required: true,
      },
      measure2: {
        type: Number,
        min: 0,
        max: 5,
        validate : Number.isInteger,
        default: 0,
        required: true,
      },
    },
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
