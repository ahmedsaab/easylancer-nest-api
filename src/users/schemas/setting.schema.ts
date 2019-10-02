import * as mongoose from 'mongoose';
import { USER_SETTINGS_ROLES } from '../../common/schema/constants';

export const SettingSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: USER_SETTINGS_ROLES.VALUES,
    default: USER_SETTINGS_ROLES.DEFAULT,
  },
}, { _id : false });
