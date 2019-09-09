import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task } from './interfaces/task.interface';
import { UsersService } from '../users/users.service';
import { OffersService } from '../offers/offers.service';
import { TaskUpdateDto } from './dto/task.update.dto';
import { MongoDataService } from '../common/providers/mongo-data.service';
import { GENERAL_USER_SUMMARY_PROP, TASK_STATUSES } from '../common/schema/constants';
import { TaskCreateDto } from './dto/task.create.dto';
import { DeferredActionsQueue } from '../common/utils/helpers';

// const UPDATE_OPTIONS = { new: true, runValidators: true };
const POPULATION_PROPS = {
  creatorUser: GENERAL_USER_SUMMARY_PROP,
  workerUser: GENERAL_USER_SUMMARY_PROP,
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
    return this.taskModel.find()
      .populate(this.refsToProps(['creatorUser']));
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
    const task = new this.taskModel(data);

    await this.usersService.get(data.creatorUser);
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

  // TODO: Lock task before update, retry to gain lock X times on locked resource
  async update(id: string, data: TaskUpdateDto): Promise<Task> {
    const taskNew: Task = await this.get(id);
    const actionQueue = new DeferredActionsQueue();
    const taskOld = taskNew.toJSON();

    taskNew.set(data);

    if (
      (
        data.price || data.endDateTime || data.startDateTime ||
        data.description || data.paymentMethod || data.title ||
        data.location || data.tags || data.imagesUrls
      ) && taskOld.status !== 'open'
    ) {
        throw new ConflictException(
          `Cannot update these attributes because task 'status' is not 'open'`,
        );
    }
    if (data.creatorRating || data.workerRating) {
      if (data.acceptedOffer) {
        throw new UnprocessableEntityException(
          `Cannot set "creatorRating" or "workerRating" while setting "acceptedOffer"`,
        );
      } else if (!TASK_STATUSES.REVIEWABLE_VALUES.includes(taskOld.status)) {
        throw new ConflictException(
          `Cannot add a rating for a task in the '${taskOld.status}' status`,
        );
      } else {
        if (data.creatorRating) {
          taskNew.creatorRating.set(data.creatorRating);
          actionQueue.queue({
            method: this.usersService.addReview.bind(this.usersService),
            params: [taskNew.workerUser, {
              like: data.creatorRating.like,
              rating: data.creatorRating.rating,
            }],
          });
        }
        if (data.workerRating) {
          taskNew.workerRating.set(data.workerRating);
          actionQueue.queue({
            method: this.usersService.addReview.bind(this.usersService),
            params: [taskNew.creatorUser, {
              like: data.workerRating.like,
              rating: data.workerRating.rating,
            }],
          });
        }

        const creatorVote = taskNew.creatorRating && taskNew.creatorRating.like;
        const workerVote = taskNew.workerRating && taskNew.workerRating.like;

        if (creatorVote === true && workerVote === true) {
          taskNew.status = 'done';
        } else if (creatorVote === false && workerVote === false) {
          taskNew.status = 'not-done';
        } else if (
          taskNew.creatorRating && taskNew.workerRating &&
          creatorVote !== workerVote
        ) {
          taskNew.status = 'investigate';
        } else {
          taskNew.status = 'pending-review';
        }
      }
    }
    if (data.location) {
      taskNew.location.set(data.location);
      if (data.location.geo) {
        taskNew.location.geo.set(data.location.geo);
      }
    }
    if (data.acceptedOffer) {
      const offer = await this.offersService.get(data.acceptedOffer);

      if (taskOld.acceptedOffer) {
        throw new ConflictException(
          `Cannot set 'acceptedOffer' because attribute is already set`);
      } else if (taskOld.status !== 'open') {
        throw new ConflictException(
          `Cannot set 'acceptedOffer because task 'status' is not 'open'`,
        );
      }

      taskNew.status = 'assigned';
      taskNew.price = offer.price;
      taskNew.paymentMethod = offer.paymentMethod;
      taskNew.workerUser = offer.workerUser;
    }
    if (data.status) {
      if (data.creatorRating || data.workerRating || data.acceptedOffer) {
        throw new UnprocessableEntityException(
          `Cannot set "status" while setting creatorRating", ` +
          `"workerRating", or "acceptedOffer"`,
        );
      }
      if (!TASK_STATUSES.isValidNext(taskOld.status, data.status)) {
        throw new ConflictException(
          `Cannot change task to status '${data.status}' ` +
          `given current is '${taskOld.status}'`,
        );
      }
      if (data.status === 'in-progress' && taskOld.startDateTime > Date.now()) {
        throw new ConflictException(
          `Cannot set task to '${data.status}' ` +
          `before it's start time of '${taskOld.startDateTime}'`,
        );
      }
      taskNew.status = data.status;
    }
    if (
      taskNew.isModified('status')
    ) {
      if (TASK_STATUSES.FINISHED_VALUES.includes(taskNew.status)) {
        actionQueue.queue({
          method: this.usersService.finishTask.bind(this.usersService),
          params: [taskNew.workerUser, taskNew.id],
        });
        actionQueue.queue({
          method: this.usersService.addTags.bind(this.usersService),
          params: [taskNew.workerUser, taskNew.tags],
        });
      } else if (taskNew.status === 'assigned') {
        actionQueue.queue({
          method: this.usersService.assignTask.bind(this.usersService),
          params: [taskNew.workerUser, taskNew.id],
        });
      }
    }

    await taskNew.save();
    actionQueue.execute();

    return taskNew;
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
