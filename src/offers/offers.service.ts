import {
  BadRequestException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Offer } from './interfaces/offer.interface';
import { UsersService } from '../users/users.service';
import { TasksService } from '../tasks/tasks.service';
import { MongoError } from 'mongodb';
import { MongoDataService } from '../common/providers/mongo-data.service';
import { USER_SUMMARY_PROP } from '../common/schema/constants';

const POPULATION_PROPS = {
  workerUser: USER_SUMMARY_PROP,
};

@Injectable()
export class OffersService extends MongoDataService {
  constructor(
    @InjectModel('Offer')
    private readonly offerModel: Model<Offer>,
    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
  ) {
    super(POPULATION_PROPS);
  }

  async findAll(): Promise<Offer[]> {
    return this.offerModel.find()
      .populate(this.DEF_PROP);
  }

  async removeAll(): Promise<any> {
    return this.offerModel.deleteMany({});
  }

  async get(id: string): Promise<Offer> {
    const offer = await this.offerModel.findById(id);

    if (!offer) {
      throw new NotFoundException(`No offer found with id: ${id}`);
    }
    return offer;
  }

  async remove(id: string): Promise<any> {
    return await this.offerModel.deleteOne({ _id: id });
  }

  async create(data: Partial<Offer>): Promise<Offer> {
    try {
      const offer = new this.offerModel(data);

      await offer.save();

      return offer;
    } catch (error) {
      if (error.name === 'MongoError' && error.code === 11000) {
        throw new UnprocessableEntityException(
          `Offer already exist for user ${data.workerUser} on task ${data.task}`,
        );
      }
      throw error;
    }

  }

  async findByTask(taskId, query?: Partial<Offer>): Promise<Offer[]> {
    return this.offerModel.find({ task: taskId, ...query })
      .populate(this.DEF_PROP);
  }

  async find(query?: Partial<Offer>): Promise<Offer[]> {
    return this.offerModel.find(query);
  }

  async removeByTask(taskId) {
    return this.offerModel.deleteMany({ task: taskId });
  }

  async update(id: string, data: any): Promise<Offer> {
    const offer = await this.offerModel.findById(id);

    offer.set(data);
    await offer.save(data);
    return offer;
  }
}
