import * as mongoose from 'mongoose';

export const TagSchema = new mongoose.Schema({
  value: {
    type: String,
    minlength: 3,
  },
  count: {
    type: Number,
    validate : c => Number.isInteger(c) && c > 0,
  },
}, { _id : false });
