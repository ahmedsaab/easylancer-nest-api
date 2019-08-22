import { Document } from 'mongoose';

interface Geo {
  lat: number;
  lng: number;
}

export interface Location extends Document {
  geo: Geo;
  country: string;
  city: string;
  address: string;
}
