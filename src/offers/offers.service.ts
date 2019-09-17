import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Offer } from './interfaces/offer.interface';
import { UsersService } from '../users/users.service';
import { TasksService } from '../tasks/tasks.service';
import { MongoError, ObjectId } from 'mongodb';
import { MongoDataService } from '../common/providers/mongo-data.service';
import { TASK_SUMMARY_PROP, WORKER_USER_SUMMARY_PROP } from '../common/schema/constants';
import { FindOfferQuery } from './dto/query/find-offer.query';
import { OfferCreateDto } from './dto/offer.create.dto';
import { OfferUpdateDto } from './dto/offer.update.dto';
import { OfferSchema, OfferSchemaDefinition } from './schemas/offer.schema';
import { TaskOffers } from './interfaces/task-offers.interface';

const POPULATION_PROPS = {
  workerUser: WORKER_USER_SUMMARY_PROP,
  task: TASK_SUMMARY_PROP,
};

@Injectable()
export class OffersService extends MongoDataService<Offer<ObjectId, ObjectId>> {
  constructor(
    @InjectModel('Offer')
    protected readonly MODEL: Model<Offer<ObjectId, ObjectId>>,
    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {
    super(POPULATION_PROPS, OfferSchema, OfferSchemaDefinition, MODEL);
  }

  async get(id: string): Promise<Offer<ObjectId, ObjectId>> {
    const offer = await this.MODEL.findById(id);

    if (!offer) {
      throw new NotFoundException(`No offer found with id: ${id}`);
    }
    return offer;
  }

  async getPopulate(id: string, refs: string[]): Promise<Offer<ObjectId, ObjectId>> {
    const offer = await this.MODEL.findById(id)
      .populate(refs.length ? this.refsToProps(refs) : this.DEF_PROP);

    if (!offer) {
      throw new NotFoundException(`No offer found with id: ${id}`);
    }

    return offer;
  }

  async remove(id: string): Promise<any> {
    const [ offer, isAccepted ] = await Promise.all([
      this.get(id),
      this.tasksService.find({ acceptedOffer: id })
        .then(task => task.length > 0),
    ]);

    if (isAccepted) {
      throw new ConflictException(
        `Offer cannot be deleted because it is accepted`,
      );
    }

    await this.MODEL.deleteOne({ _id: id });
    this.usersService.withdrawFromTask(
      offer.workerUser.toHexString(),
      offer.task.toHexString(),
    );

    return offer;
  }

  async create(data: OfferCreateDto): Promise<Offer<ObjectId, ObjectId>> {
    const offer = new this.MODEL(data);
    const [ task ] = await Promise.all([
      this.tasksService.get(data.task),
      this.usersService.get(data.workerUser),
    ]);

    if (task.creatorUser.equals(data.workerUser)) {
      throw new UnprocessableEntityException(
        'Users cannot make an offer to their own tasks',
      );
    } else if (task.status !== 'OPEN') {
      throw new ConflictException(
        `Task is closed for offers: status = ${task.status}`,
      );
    } else {
      try {
        await offer.save();
      } catch (error) {
        if (error.name === 'MongoError' && error.code === 11000) {
          throw new ConflictException(
            `Offer already exist for (user, task) => (${data.workerUser}, ${data.task})`,
          );
        }
        throw error;
      }
      this.usersService.applyToTask(data.workerUser, task.id);

      return offer;
    }
  }

  async update(id: string, data: OfferUpdateDto): Promise<Offer<ObjectId, ObjectId>> {
    const offer = await this.getPopulate(id, ['task']) as any;

    if (offer.task.status !== 'OPEN') {
      throw new ConflictException(
        `Task is closed for offers: status = ${offer.task.status}`,
      );
    }

    offer.set(data);
    await offer.save(data);

    return offer;
  }

  async find(query?: FindOfferQuery, refs: string[] = []): Promise<Array<Offer<ObjectId, ObjectId>>> {
    return this.MODEL.find(query)
      .populate(this.refsToProps(refs));
  }

  async removeMany(query?: FindOfferQuery): Promise<Array<Offer<ObjectId, ObjectId>>>  {
    const offers = await this.MODEL.find(query);
    const cannotDelete = await this.tasksService.find({
      acceptedOffer: {
        $in: offers.map(offer => offer.id),
      },
    }).then(tasks => tasks.length > 0);

    if (cannotDelete) {
      throw new ConflictException(
        `Offers cannot be deleted because some are already accepted`,
      );
    }

    await this.MODEL.deleteMany(query);

    Promise.all(offers.map(offer => (
      this.usersService.withdrawFromTask(
        offer.workerUser.toHexString(),
        offer.task.toHexString(),
      )
    ))).catch(error => console.error(error));

    return offers;
  }

  async countForTasks(taskIds: ObjectId[]): Promise<TaskOffers[]> {
    return (
      this.MODEL.aggregate([
        {
          $match: {
            task: {
              $in: taskIds,
            },
          },
        },
        {
          $group: {
            _id: '$task',
            count: { $sum: 1 },
          },
        },
      ])
    ) as unknown as Promise<TaskOffers[]>;
  }
}
