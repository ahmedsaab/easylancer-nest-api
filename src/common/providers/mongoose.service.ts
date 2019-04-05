import { Injectable } from '@nestjs/common';
import { MongooseModuleOptions, MongooseOptionsFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
// import * as existsValidator from 'mongoose-exists';
// import * as uniqueValidator from 'mongoose-beautiful-unique-validation';

@Injectable()
export class MongoService implements MongooseOptionsFactory {
  createMongooseOptions(): MongooseModuleOptions {
    // mongoose.plugin(existsValidator);
    // mongoose.plugin(uniqueValidator);
    mongoose.set('debug', true);
    return {
      uri: 'mongodb://dbadmin:easylancer88@localhost:27017/core-db',
      useNewUrlParser: true,
      useCreateIndex: true,
    };
  }
}
