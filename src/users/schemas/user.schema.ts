import * as mongoose from 'mongoose';
import { BadgeSchema } from './badge.schema';
import { SettingSchema } from './setting.schema';
import { UserRatingSchema } from './user-rating.schema';
import { PhoneNumberUtil } from 'google-libphonenumber';

const { ObjectId } = mongoose.Schema.Types;

export const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    maxlength: 50,
  },
  about: {
    type: String,
    default: '',
    maxlength: 400,
  },
  city: {
    type: String,
    default: null,
    maxlength: 30,
  },
  password: {
    type: String,
    required: true,
  },
  birthDate: {
    type: Date,
    default: null,
  },
  phoneNumber: {
    type: String,
    default: null,
    validate: (num) => {
      try {
        if (num) {
          PhoneNumberUtil.getInstance().parse(num);
        }
        return true;
      } catch (e) {
        return false;
      }
    },
  },
  createdTasks: {
    type: [ObjectId],
    ref: 'Task',
    default: [],
  },
  acceptedTasks: {
    type: [ObjectId],
    ref: 'Task',
    default: [],
  },
  finishedTasks: {
    type: [ObjectId],
    ref: 'Task',
    default: [],
  },
  appliedTasks: {
    type: [ObjectId],
    ref: 'Task',
    default: [],
  },
  lastName: {
    type: String,
    default: null,
    maxlength: 30,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
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
}, { versionKey: false });
