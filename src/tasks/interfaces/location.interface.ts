import { Document } from 'mongoose';

export interface Location extends Document {
  lat: number;
  lng: number;
}
