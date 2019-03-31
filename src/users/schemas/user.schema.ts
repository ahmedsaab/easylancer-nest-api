import * as mongoose from 'mongoose';
import { BadgeSchema } from './badge.schema';
import { UserTasksStatSchema } from './user-tasks-stat.schema';

export const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: 30,
    match: /^[a-z0-9]+$/i,
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
  tasks: {
    type: UserTasksStatSchema,
    default: {},
  },
});
