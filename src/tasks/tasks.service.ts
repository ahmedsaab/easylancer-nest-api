import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
  MethodNotAllowedException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task } from './interfaces/task.interface';
import { UsersService } from '../users/users.service';
import { Offer } from '../offers/interfaces/offer.interface';
import { OffersService } from '../offers/offers.service';
import { TaskUpdateDto } from './dto/task.update.dto';
import { OfferCreateDto } from '../offers/dto/offer.create.dto';
import { OfferUpdateDto } from '../offers/dto/offer.update.dto';
import { MongoDataService } from '../common/providers/mongo-data.service';
import { USER_SUMMARY_PROP, TASK_STATUSES } from '../common/schema/constants';
import { TaskCreateDto } from './dto/task.create.dto';
import { DeferredActionsQueue } from '../common/utils/helpers';

// const UPDATE_OPTIONS = { new: true, runValidators: true };
const POPULATION_PROPS = {
  creatorUser: USER_SUMMARY_PROP,
  workerUser: USER_SUMMARY_PROP,
};

@Injectable()
export class TasksService extends MongoDataService {
  constructor(
    @InjectModel('Task')
    private readonly taskModel: Model<Task>,
    @Inject(forwardRef(() => OffersService))
    private readonly offersService: OffersService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {
    super(POPULATION_PROPS);
  }

  async findAll(): Promise<Task[]> {
    return this.taskModel.find();
  }

  async removeAll(): Promise<any> {
    return this.taskModel.deleteMany({});
  }

  async getPopulate(id: string): Promise<Task> {
    const task = await this.taskModel.findById(id)
      .populate(this.DEF_PROP);

    if (!task) {
      throw new NotFoundException(`task with id ${id} not found`);
    }

    return task;
  }

  async get(id: string): Promise<Task> {
    const task: Task = await this.taskModel.findById(id);

    if (!task) {
      throw new NotFoundException(`No task found with id ${id}`);
    }

    return task;
  }

  async remove(id: string): Promise<any> {
    return this.taskModel.deleteOne({ _id: id });
  }

  async create(data: TaskCreateDto): Promise<Task> {
    await this.usersService.get(data.creatorUser);
    const task = new this.taskModel(data);

    await task.save();
    this.usersService.createTask(data.creatorUser, task._id);

    return task;
  }

  async findByIds(ids): Promise<Task[]> {
    const objectIds = ids.map(id => new Types.ObjectId(id));

    return this.taskModel.find({ _id: { $in: objectIds } });
  }

  async find(query, refs?: string[]): Promise<Task[]> {
    if (refs) {
      return this.taskModel.find(query)
        .populate(this.refsToProps(refs));
    } else {
      return this.taskModel.find(query);
    }
  }

  async update(id: string, data: TaskUpdateDto): Promise<Task> {
    const task: Task = await this.get(id);
    const actionQueue = new DeferredActionsQueue();

    task.set(data);

    if (
      (data.creatorRating || data.workerRating) &&
      !TASK_STATUSES.REVIEWABLE_VALUES.includes(task.status)
    ) {
      throw new MethodNotAllowedException(
        `Cannot add a rating for a task in this status, status = ${task.status}`,
      );
    }
    if (data.creatorRating) {
      task.creatorRating.set(data.creatorRating);
    }
    if (data.workerRating) {
      task.workerRating.set(data.workerRating);
    }
    if (data.location) {
      task.location.set(data.location);
    }
    if (data.acceptedOffer) {
      const offer = await this.offersService.get(data.acceptedOffer);

      if (task.acceptedOffer !== null) {
        throw new MethodNotAllowedException('Task already has an accepted offer');
      } else if (data.status && data.status !== 'accepted') {
        throw new MethodNotAllowedException(
          `Only task 'status' value of "accepted" is allowed when assigning a task`,
        );
      }
      data.status = 'accepted';
      task.workerUser = offer.workerUser;
      actionQueue.queue({
        method: this.usersService.assignTask,
        params: [task.workerUser, task.id],
      });
    }
    if (data.status) {
      if (!TASK_STATUSES.isValidNext(task.status, data.status)) {
        throw new MethodNotAllowedException(
          `Cannot change task to this status, current status = ${task.status}`,
        );
      }
      if (TASK_STATUSES.FINISHED_VALUES.includes(data.status)) {
        actionQueue.queue({
          method: this.usersService.finishTask,
          params: [task.workerUser, task.id],
        });
      }
    }

    await task.save();
    actionQueue.execute();

    return task;
  }

  async seenByUser(id: string, userId: string): Promise<Partial<Task>> {
    const user = await this.taskModel.findOneAndUpdate({ _id: id }, {
      $addToSet: {
        seenBy: userId,
      },
    }, { new: true });

    return user.seenBy.map((objectId: Types.ObjectId) =>
      objectId.toString(),
    );
  }
}
