import * as mongoose from 'mongoose';

export const UserTasksStatSchema = new mongoose.Schema({
  created: {
    type: Number,
    min: 0,
    validate : Number.isInteger,
    default: 0,
  },
  finished: {
    type: Number,
    min: 0,
    validate : Number.isInteger,
    default: 0,
  },
}, { _id : false });
