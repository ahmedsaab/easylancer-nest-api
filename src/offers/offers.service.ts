import {
  forwardRef,
  Inject,
  Injectable,
  UnprocessableEntityException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AnyOffer, OfferDocument, Offer, OfferWithTask } from './interfaces/offer.interface';
import { UsersService } from '../users/users.service';
import { TasksService } from '../tasks/tasks.service';
import { MongoError, ObjectId } from 'mongodb';
import { MongoDataService } from '../common/providers/mongo-data.service';
import { FindOfferQuery } from './dto/query/find-offer.query';
import { OfferCreateDto } from './dto/offer.create.dto';
import { OfferUpdateDto } from './dto/offer.update.dto';
import { OfferSchema, OfferSchemaDefinition } from './schemas/offer.schema';
import { WORKER_USER_SUMMARY_PROP, GENERAL_USER_SUMMARY_PROP } from '../users/interfaces/user.interface';
import { Task, TaskOfferCount, TASK_SUMMARY_PROP } from '../tasks/interfaces/task.interface';

const POPULATION_PROPS = {
  'workerUser': WORKER_USER_SUMMARY_PROP,
  'task': TASK_SUMMARY_PROP,
  'task.creatorUser': GENERAL_USER_SUMMARY_PROP,
};

@Injectable()
export class OffersService extends MongoDataService<OfferDocument, AnyOffer> {
  constructor(
    @InjectModel('Offer')
    protected readonly MODEL: Model<OfferDocument>,
    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {
    super(POPULATION_PROPS, OfferSchema, OfferSchemaDefinition, MODEL);
  }

  async remove(id: ObjectId): Promise<Offer> {
    const [ offer, isAccepted ] = await Promise.all([
      this.get<Offer>(id),
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
      offer.workerUser,
      offer.task,
    );

    return offer;
  }

  async create(data: OfferCreateDto): Promise<Offer> {
    const offer = new this.MODEL(data);
    const [ task ] = await Promise.all([
      this.tasksService.get<Task>(data.task),
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
      this.usersService.applyToTask(data.workerUser, task._id);

      return offer;
    }
  }

  async update(id: ObjectId, data: OfferUpdateDto): Promise<Offer> {
    const offer = await this.get<OfferWithTask>(id, ['task']);

    if (offer.task.status !== 'OPEN') {
      throw new ConflictException(
        `Task is closed for offers: status = ${offer.task.status}`,
      );
    }

    return this.MODEL.findByIdAndUpdate(id, data);
  }

  async removeMany(query?: FindOfferQuery): Promise<Offer[]>  {
    const offers = await this.MODEL.find(query);
    const cannotDelete = await this.tasksService.find({
      acceptedOffer: {
        $in: offers.map(offer => offer._id),
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
        offer.workerUser,
        offer.task,
      )
    ))).catch(error => console.error(error));

    return offers;
  }

  async countForTasks(taskIds: ObjectId[]): Promise<TaskOfferCount[]> {
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
    ) as unknown as Promise<TaskOfferCount[]>;
  }
}
