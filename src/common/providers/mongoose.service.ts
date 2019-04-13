import { Injectable } from '@nestjs/common';
import { MongooseModuleOptions, MongooseOptionsFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ConfigService } from '../../config/config.service';
// import * as existsValidator from 'mongoose-exists';
// import * as uniqueValidator from 'mongoose-beautiful-unique-validation';

@Injectable()
export class MongoService implements MongooseOptionsFactory {
  private readonly dbUri: string;
  private readonly debug: boolean;

  constructor(config: ConfigService) {
    this.dbUri = config.dbUri;
    this.debug = config.debug;
  }
  createMongooseOptions(): MongooseModuleOptions {
    // mongoose.plugin(existsValidator);
    // mongoose.plugin(uniqueValidator);
    if (this.debug) {
      mongoose.set('debug', true);
    }
    return {
      uri: this.dbUri,
      useNewUrlParser: true,
      useCreateIndex: true,
    };
  }
}
