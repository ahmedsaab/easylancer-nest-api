import * as mongoose from 'mongoose';
import { GeoSchema } from './geo.schema';

export const LocationSchema = new mongoose.Schema({
  geo: {
    type: GeoSchema,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
}, { _id : false });
