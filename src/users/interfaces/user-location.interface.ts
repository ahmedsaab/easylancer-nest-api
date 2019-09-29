import { Document } from 'mongoose';

export interface UserLocation extends Document {
  country: string;
  city: string;
}
