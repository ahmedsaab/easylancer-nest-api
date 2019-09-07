import { Document } from 'mongoose';

export interface TaskRating extends Document {
  createdAt: Date;
  rating: number;
  description: string;
  like: boolean;
}

interface Criteria {
  measure1: number;
  measure2: number;
}
