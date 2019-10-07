import * as mongoose from 'mongoose';

export const UserLocationSchema = new mongoose.Schema({
  city: {
    type: String,
    required: () => !!this.country,
  },
  country: {
    type: String,
    required: () => !!this.city,
  },
}, { _id : false });
