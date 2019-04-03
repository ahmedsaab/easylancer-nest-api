import * as mongoose from 'mongoose';

export const LocationSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: true,
  },
  lon: {
    type: Number,
    required: true,
  },
}, { _id : false });
