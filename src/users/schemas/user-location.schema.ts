import * as mongoose from 'mongoose';

export const UserLocationSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
}, { _id : false });
