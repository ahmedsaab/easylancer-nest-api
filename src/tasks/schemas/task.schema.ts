import * as mongoose from 'mongoose';

export const TaskSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  price: {
    type: Number,
    min: 10,
    default: 50,
    max: 10000,
  },
  title: {
    type: String,
    required: true,
    maxlength: 40,
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
  paymentMethod: {
    type: String,
    enum: ['card', 'cash'],
    default: 'card',
  },
  imagesUrls: [String],
});
