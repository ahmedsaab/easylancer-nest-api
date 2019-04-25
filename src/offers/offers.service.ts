import {
  forwardRef,
  Inject,
  Injectable,
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
import { TASK_SUMMARY_PROP, USER_SUMMARY_PROP } from '../common/schema/constants';
import { FindOfferQuery } from './dto/query/find-offer.query';
import { OfferCreateDto } from './dto/offer.create.dto';
import { OfferUpdateDto } from './dto/offer.update.dto';

const POPULATION_PROPS = {
  workerUser: USER_SUMMARY_PROP,
  task: TASK_SUMMARY_PROP,
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

  async get(id: string): Promise<Offer> {
    const offer = await this.offerModel.findById(id);

    if (!offer) {
      throw new NotFoundException(`No offer found with id: ${id}`);
    }
    return offer;
  }

  async getPopulate(id: string, refs: string[]): Promise<Offer> {
    const offer = await this.offerModel.findById(id)
      .populate(refs.length ? this.refsToProps(refs) : this.DEF_PROP);

    if (!offer) {
      throw new NotFoundException(`No offer found with id: ${id}`);
    }

    return offer;
  }

  async remove(id: string): Promise<any> {
    return await this.offerModel.deleteOne({ _id: id });
  }

  async create(data: OfferCreateDto): Promise<Offer> {
    const offer = new this.offerModel(data);
    const [ task ] = await Promise.all([
      this.tasksService.get(data.task),
      this.usersService.get(data.workerUser),
    ]);

    if (task.creatorUser.equals(data.workerUser)) {
      throw new UnprocessableEntityException(
        'Users cannot make an offer to their own tasks',
      );
    } else if (task.status !== 'open') {
      throw new UnprocessableEntityException(
        `Task is closed for offers: status = ${task.status}`,
      );
    } else {
      try {
        await offer.save();
      } catch (error) {
        if (error.name === 'MongoError' && error.code === 11000) {
          throw new UnprocessableEntityException(
            `Offer already exist for (user, task) => (${data.workerUser}, ${data.task})`,
          );
        }
        throw error;
      }
      this.usersService.applyToTask(data.workerUser, task.id);

      return offer;
    }
  }

  async update(id: string, data: OfferUpdateDto): Promise<Offer> {
    const offer = await this.getPopulate(id, ['task']) as any;

    if (offer.task.status !== 'open') {
      throw new UnprocessableEntityException(
        `Task is closed for offers: status = ${offer.task.status}`,
      );
    }

    offer.set(data);
    await offer.save(data);

    return offer;
  }

  async find(query?: FindOfferQuery, refs: string[] = []): Promise<Offer[]> {
    return this.offerModel.find(query)
      .populate(this.refsToProps(refs));
  }

  async removeMany(query?: FindOfferQuery) {
    return this.offerModel.deleteMany(query);
  }
}
