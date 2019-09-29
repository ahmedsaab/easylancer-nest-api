import { Document } from 'mongoose';

interface Geo extends Document  {
  lat: number;
  lng: number;
}

export interface TaskLocation extends Document {
  geo: Geo;
  country: string;
  city: string;
  address: string;
}
