import * as mongoose from 'mongoose';
import { BadgeSchema } from './badge.schema';
import { TagSchema } from './tag.schema';
import { SettingSchema } from './setting.schema';
import { UserRatingsSchema } from './user-ratings.schema';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { LANGUAGES } from '../../common/schema/constants';
import { UserLocationSchema } from './user-location.schema';
import * as avatars from './avatars.json';

const { ObjectId } = mongoose.Schema.Types;

export const UsersCollectionName = 'users';

export const UserSchemaDefinition = {
  about: {
    type: String,
    default: '',
    maxlength: 400,
  },
  auth: {
    type: String,
    required: true,
    unique: true,
  },
  city: {
    type: String,
    default: null,
    maxlength: 30,
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
    default: () => avatars[Math.floor(Math.random() * avatars.length)].url,
  },
  imagesUrls: [String],
  languages: {
    type: [String],
    enum: LANGUAGES.VALUES,
  },
  location: {
    type: UserLocationSchema,
    default: {},
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
  tags: [TagSchema],
  ratings: {
    type: UserRatingsSchema,
    default: {},
  },
  settings: {
    type: SettingSchema,
    default: {},
  },
};

export const UserSchema = new mongoose.Schema(
  UserSchemaDefinition, {
    versionKey: false,
    collection: UsersCollectionName,
  },
);
