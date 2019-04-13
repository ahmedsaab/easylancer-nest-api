import * as mongoose from 'mongoose';
import { BadgeSchema } from './badge.schema';
import { SettingSchema } from './setting.schema';
import { UserRatingSchema } from './user-rating.schema';

const { ObjectId } = mongoose.Schema.Types;

export const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    maxlength: 50,
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