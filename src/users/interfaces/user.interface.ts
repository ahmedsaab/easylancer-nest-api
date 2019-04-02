import * as mongoose from 'mongoose';

export interface User extends mongoose.Document {
  id: number;
  name: string;
  age: number;
  breed: string;
}
