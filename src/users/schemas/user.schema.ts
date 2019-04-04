import * as mongoose from 'mongoose';
import 'mongoose-type-email';
import { BadgeSchema } from './badge.schema';
import { SettingSchema } from './setting.schema';
import { UserRatingSchema } from './user-rating.schema';

export const UserSchema = new mongoose.Schema({
  email: {
    type: mongoose.SchemaTypes.Email,
    required: true,
    unique: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    default: null,
    maxlength: 30,
  },
  firstName: {
    type: String,
    default: null,
    maxlength: 30,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  dislikes: {
    type: Number,
    min: 0,
    validate : Number.isInteger,
    default: 0,
  },
  likes: {
    type: Number,
    min: 0,
    validate : Number.isInteger,
    default: 0,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    set: (val) => this.createdAt ? this.createdAt : val,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other',
  },
  badges: [BadgeSchema],
  ratings: {
    type: UserRatingSchema,
    default: {},
  },
  settings: {
    type: SettingSchema,
    default: {},
  },
});
