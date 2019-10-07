import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserCreateDto } from './dto/user.create.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, User, AnyUser } from './interfaces/user.interface';
import { MyAppliedTask, MyCreatedTask, TaskWithCreator, TaskWithWorker, Task } from '../tasks/interfaces/task.interface';
import { TasksService } from '../tasks/tasks.service';
import { TaskReview } from '../tasks/interfaces/task-review.interface';
import { UserCreateBadgeDto } from './dto/user.create.badge.dto';
import { Badge } from './interfaces/bade.interface';
import { TASK_STATUSES } from '../common/schema/constants';
import { UserReview } from './interfaces/user-review.interface';
import { TaskSearchDto } from '../tasks/dto/search/task.search.dto';
import { Pagination } from '../common/interfaces/pagination.interface';
import { MongoDataService } from '../common/providers/mongo-data.service';
import { UserSchema, UserSchemaDefinition } from './schemas/user.schema';
import { ObjectId } from 'mongodb';
import { OffersService } from '../offers/offers.service';
import { OfferWithTaskWithCreator } from '../offers/interfaces/offer.interface';
import { UserUpdateDto } from './dto/user.update.dto';

@Injectable()
export class UsersService extends MongoDataService<UserDocument, AnyUser> {
  constructor(
    @InjectModel('User')
    protected readonly MODEL: Model<UserDocument>,
    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,
    @Inject(forwardRef(() => OffersService))
    private readonly offersService: OffersService,
  ) {
    super({}, UserSchema, UserSchemaDefinition, MODEL);
  }

  async removeAll(): Promise<any> {
    return this.MODEL.deleteMany({});
  }

  async remove(id: ObjectId): Promise<User> {
    return this.MODEL.findOneAndRemove({ _id: id });
  }

  async create(dto: UserCreateDto): Promise<User> {
    return this.MODEL.create(dto);
  }

  async addTags(id: ObjectId, tags: [string]): Promise<void> {
    try {
      const user = await this.get<UserDocument>(id);

      tags.forEach(tag => {
        const existentTagIndex = user.tags.findIndex(userTag =>
          userTag.value === tag,
        );

        if (existentTagIndex !== -1) {
          user.tags[existentTagIndex].count += 1;
        } else {
          user.tags.push({
            value: tag,
            count: 1,
          });
        }
      });

      await user.save();
    } catch (error) {
      console.error(error);
    }
  }

  async addReview(id: string, review: UserReview): Promise<void> {
    try {
      const key = `ratings.${review.profile}.${review.like ? 'likes' : 'dislikes'}`;
      const rating = review.like ? {
        [`ratings.${review.profile}.count`] : 1,
        [`ratings.${review.profile}.value`] : review.rating,
      } : {};
      await this.MODEL.findByIdAndUpdate(id, {
        $inc: {
          [key]: 1,
          ...rating,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  async searchAppliedTasks(
    id: string,
    search: TaskSearchDto,
  ): Promise<Pagination<MyAppliedTask>> {
    const match = this.tasksService.readSearchQuery({
      workerUser: { type: 'eq', value: id },
    });
    const matchPopulated = this.tasksService.readSearchQuery(
      search.query, 'task',
    );
    const offersPagination = (
      await this.offersService.search<OfferWithTaskWithCreator>(
        match, [ 'task' , 'task.creatorUser'],
        search.pageSize, search.pageNo,
        matchPopulated,
      )
    );

    return {
      ...offersPagination,
      page: offersPagination.page.map(offerWithTask => {
        const { task, ...offer } = offerWithTask;

        return {
          ...task,
          offer: {
            ...offer,
            task: task._id,
          },
        };
      }),
    };
  }

  async searchCreatedTasks(
    id: string,
    search: TaskSearchDto,
  ): Promise<Pagination<MyCreatedTask>> {
    const match = this.tasksService.readSearchQuery(
      Object.assign(search.query || {}, {
        creatorUser: { type: 'eq', value: id },
      }),
    );
    const tasksPagination = await this.tasksService.search<TaskWithWorker>(
      match, [ 'workerUser' ],
      search.pageSize, search.pageNo,
    );
    const taskOfferCount = await this.offersService.countForTasks(
      tasksPagination.page.map(task => task._id),
    );

    return {
      ...tasksPagination,
      page: tasksPagination.page.map(task => ({
        ...task,
        offers: (taskOfferCount.find(t =>
          t._id.equals(task._id),
        ) || { count: 0 }).count,
      })),
    };
  }

  async setLastSeen(id: ObjectId, dateTime?: Date): Promise<User> {
    const user = await this.MODEL.findByIdAndUpdate(id, {
      lastSeen: (dateTime || new Date()).toUTCString(),
    });

    if (!user) {
      throw new NotFoundException(`No user found with id ${id}`);
    }

    return user;
  }

  async addBadge(id: ObjectId, badge: UserCreateBadgeDto): Promise<Badge[]> {
    const user = await this.MODEL.findByIdAndUpdate(id, {
      $addToSet: {
        badges: badge,
      },
    }, { new: true });

    return user.badges;
  }

  async removeBadge(id: ObjectId, badgeName: string): Promise<Badge> {
    const resp = await this.MODEL.updateOne({
      _id: id,
    }, {
      $pull: {
        badges: { name: badgeName },
      },
    });

    if (resp.nModified !== 1) {
      throw new NotFoundException(`No user found with id ${id}`);
    }
    return {
      name: badgeName,
    };
  }

  async getRelatedTasks(id: ObjectId): Promise<Task[]> {
    const user = await this.get<User>(id);
    const { acceptedTasks, appliedTasks, createdTasks, finishedTasks } = user;

    const taskIds =
      [...acceptedTasks, ...appliedTasks, ...createdTasks, ...finishedTasks];

    return this.tasksService.findByIds(taskIds);
  }

  async getReviews(id: ObjectId): Promise<TaskReview[]> {
    const tasks = await this.tasksService.find<TaskWithCreator>({
      workerUser: id,
      status: { $in: TASK_STATUSES.FINISHED_VALUES },
    }, [ 'creatorUser']);

    return tasks.map((task) => ({
      creatorUser: task.creatorUser,
      ...task.creatorRating.toJSON(),
    }));
  }

  async update(id: ObjectId, data: UserUpdateDto): Promise<User> {
    return this.MODEL.findOneAndUpdate({ _id: id }, data, { new: true });
  }

  applyToTask(id: ObjectId, taskId: ObjectId): void {
    this.MODEL.findOneAndUpdate({ _id: id }, {
      $addToSet: {
        appliedTasks: taskId,
      },
    }).catch((error) => {
      console.error(error);
    });
  }

  withdrawFromTask(id: ObjectId, taskId: ObjectId): void {
    this.MODEL.findOneAndUpdate({ _id: id }, {
      $pull: {
        appliedTasks: taskId,
      },
    }).catch((error) => {
      console.error(error);
    });
  }

  createTask(id: ObjectId, taskId: ObjectId): void {
    this.MODEL.findOneAndUpdate({ _id: id }, {
      $addToSet: {
        createdTasks: taskId,
      },
    }).catch((error) => {
      console.error(error);
    });
  }

  assignTask(id: ObjectId, taskId: ObjectId): void {
    this.MODEL.findOneAndUpdate({ _id: id }, {
      $pull: {
        appliedTasks: taskId,
      },
      $addToSet: {
        acceptedTasks: taskId,
      },
    }).catch((error) => {
      console.error(error);
    });
  }

  finishTask(id: ObjectId, taskId: ObjectId): void {
    this.MODEL.findOneAndUpdate({ _id: id }, {
      $pull: {
        acceptedTasks: taskId,
      },
      $addToSet: {
        finishedTasks: taskId,
      },
    }).catch((error) => {
      console.error(error);
    });
  }
}
