import * as mongoose from 'mongoose';

export const BadgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 30,
  },
  icon: {
    type: String,
    required: true,
  },
}, { _id : false });
