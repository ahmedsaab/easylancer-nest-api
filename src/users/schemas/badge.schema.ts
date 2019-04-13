import * as mongoose from 'mongoose';

export const BadgeSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['badge1', 'badge2', 'badge3'],
  },
}, { _id : false });
