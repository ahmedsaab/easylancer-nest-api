import {
  Inject,
  Injectable,
  forwardRef,
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Task, AnyTask, TaskDocument, TaskView, TaskWithCreator } from './interfaces/task.interface';
import { UsersService } from '../users/users.service';
import { OffersService } from '../offers/offers.service';
import { TaskUpdateDto } from './dto/task.update.dto';
import { MongoDataService } from '../common/providers/mongo-data.service';
import { TASK_STATUSES } from '../common/schema/constants';
import { TaskCreateDto } from './dto/task.create.dto';
import { DeferredActionsQueue } from '../common/utils/helpers';
import { TaskSchema, TaskSchemaDefinition } from './schemas/task.schema';
import { GENERAL_USER_SUMMARY_PROP, WORKER_USER_SUMMARY_PROP } from '../users/interfaces/user.interface';
import { Offer } from '../offers/interfaces/offer.interface';

const POPULATION_PROPS = {
  creatorUser: GENERAL_USER_SUMMARY_PROP,
  workerUser: WORKER_USER_SUMMARY_PROP,
};

@Injectable()
export class TasksService extends MongoDataService<TaskDocument, AnyTask> {
  constructor(
    @InjectModel('Task')
    protected readonly MODEL: Model<TaskDocument>,
    @Inject(forwardRef(() => OffersService))
    private readonly offersService: OffersService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {
    super(POPULATION_PROPS, TaskSchema, TaskSchemaDefinition, MODEL);
  }

  // TODO: deprecate this function in favor of the inherited search
  //  method from MongoDataService
  async findAll(): Promise<TaskWithCreator[]> {
    return this.find({}, ['creatorUser']);
  }

  // TODO: create a bulk-delete interface and return this type
  async removeAll(): Promise<number> {
    return this.MODEL.deleteMany({}).then(result =>
      result.deletedCount,
    );
  }

  async getView(id: ObjectId): Promise<TaskView> {
    return this.get(id, ['creatorUser', 'workerUser']);
  }

  async remove(id: ObjectId): Promise<Task> {
    return this.MODEL.findOneAndRemove({ _id: id });
  }

  async create(data: TaskCreateDto): Promise<Task> {
    const task = new this.MODEL(data);

    await this.usersService.get(data.creatorUser);
    await task.save();
    this.usersService.createTask(data.creatorUser, task._id);

    return task;
  }

  async findByIds(ids): Promise<Task[]> {
    const objectIds = ids.map(id => new ObjectId(id));

    return this.find({ _id: { $in: objectIds } });
  }

  // TODO: Lock task before update, retry to gain lock X times on locked resource
  async update(id: ObjectId, data: TaskUpdateDto): Promise<Task> {
    const taskNew = await this.get<TaskDocument>(id);
    const actionQueue = new DeferredActionsQueue();
    const taskOld = taskNew.toJSON();

    taskNew.set(data);

    if (
      (
        data.price || data.endDateTime || data.startDateTime ||
        data.description || data.paymentMethod || data.title ||
        data.location || data.tags || data.imagesUrls
      ) && taskOld.status !== 'OPEN'
    ) {
        throw new ConflictException(
          `Cannot update these attributes because task 'status' is not 'OPEN'`,
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
          taskNew.status = 'DONE';
        } else if (creatorVote === false && workerVote === false) {
          taskNew.status = 'NOT_DONE';
        }  else if (taskNew.creatorRating && !taskNew.workerRating) {
          taskNew.status = 'PENDING_WORKER_REVIEW';
        } else if (!taskNew.creatorRating && taskNew.workerRating) {
          taskNew.status = 'PENDING_OWNER_REVIEW';
        } else if (
          taskNew.creatorRating && taskNew.workerRating &&
          creatorVote !== workerVote
        ) {
          taskNew.status = 'INVESTIGATE';
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
      const offer = await this.offersService.get<Offer>(data.acceptedOffer);

      if (taskOld.acceptedOffer) {
        throw new ConflictException(
          `Cannot set 'acceptedOffer' because attribute is already set`);
      } else if (taskOld.status !== 'OPEN') {
        throw new ConflictException(
          `Cannot set 'acceptedOffer because task 'status' is not 'OPEN'`,
        );
      }

      taskNew.status = 'ASSIGNED';
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
      if (data.status === 'IN_PROGRESS' && taskOld.startDateTime > Date.now()) {
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
          params: [taskNew.workerUser, taskNew._id],
        });
        actionQueue.queue({
          method: this.usersService.addTags.bind(this.usersService),
          params: [taskNew.workerUser, taskNew.tags],
        });
      } else if (taskNew.status === 'ASSIGNED') {
        actionQueue.queue({
          method: this.usersService.assignTask.bind(this.usersService),
          params: [taskNew.workerUser, taskNew._id],
        });
      }
    }

    await taskNew.save();
    actionQueue.execute();

    return taskNew;
  }

  async seenByUser(id: ObjectId, userId: ObjectId): Promise<string[]> {
    const task = await this.MODEL.findOneAndUpdate({ _id: id }, {
      $addToSet: {
        seenBy: userId,
      },
    }, { new: true });

    return task.seenBy.map((objectId: ObjectId) =>
      objectId.toString(),
    );
  }
}
