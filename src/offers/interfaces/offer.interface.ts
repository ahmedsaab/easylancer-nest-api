import * as mongoose from 'mongoose';

export interface Offer extends mongoose.Document {
  id: number;
  name: string;
  age: number;
  breed: string;
}
