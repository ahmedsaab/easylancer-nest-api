import * as mongoose from 'mongoose';

export const SettingSchema = new mongoose.Schema({
  setting1: {
    type: Number,
    min: 0,
    max: 5,
    validate : Number.isInteger,
    default: 0,
  },
  setting2: {
    type: Number,
    min: 0,
    max: 5,
    validate : Number.isInteger,
    default: 0,
  },
}, { _id : false });
