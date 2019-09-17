import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserCreateDto } from './dto/user.create.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './interfaces/user.interface';
import { MyCreatedTask, Task } from '../tasks/interfaces/task.interface';
import { TasksService } from '../tasks/tasks.service';
import { TaskReview } from '../tasks/interfaces/task-review.interface';
import { UserCreateBadgeDto } from './dto/user.create.badge.dto';
import { Badge } from './interfaces/bade.interface';
import { TASK_STATUSES } from '../common/schema/constants';
import { FindUserQuery } from './dto/query/find-user.query';
import { UserReview } from './interfaces/user-review.interface';
import { TaskSearchDto } from '../tasks/dto/search/task.search.dto';
import { Pagination } from '../common/interfaces/pagination.interface';
import { MongoDataService } from '../common/providers/mongo-data.service';
import { UserSchema, UserSchemaDefinition } from './schemas/user.schema';
import { FilterQuery } from 'mongodb';
import { OffersService } from '../offers/offers.service';

@Injectable()
export class UsersService extends MongoDataService<User> {
  constructor(
    @InjectModel('User')
    protected readonly MODEL: Model<User>,
    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,
    @Inject(forwardRef(() => OffersService))
    private readonly offersService: OffersService,
  ) {
    super({}, UserSchema, UserSchemaDefinition, MODEL);
  }

  async find(query?: FindUserQuery): Promise<User[]> {
    return this.MODEL.find(query);
  }

  async removeAll(): Promise<any> {
    return this.MODEL.deleteMany({});
  }

  async get(id: string): Promise<User> {
    const user: User = await this.MODEL.findById(id);

    if (!user) {
      throw new NotFoundException(`No user found with id ${id}`);
    }

    return user;
  }

  async remove(id: string): Promise<any> {
    return this.MODEL.deleteOne({ _id: id });
  }

  async create(dto: UserCreateDto): Promise<User> {
    try {
      const user = new this.MODEL(dto);
      return user.save();
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  applyToTask(id: string, taskId: string): void {
    this.MODEL.findOneAndUpdate({ _id: id }, {
      $addToSet: {
        appliedTasks: taskId,
      },
    }).catch((error) => {
      console.error(error);
    });
  }

  withdrawFromTask(id: string, taskId: string): void {
    this.MODEL.findOneAndUpdate({ _id: id }, {
      $pull: {
        appliedTasks: taskId,
      },
    }).catch((error) => {
      console.error(error);
    });
  }

  createTask(id: string, taskId: string): void {
    this.MODEL.findOneAndUpdate({ _id: id }, {
      $addToSet: {
        createdTasks: taskId,
      },
    }).catch((error) => {
      console.error(error);
    });
  }

  assignTask(id: string, taskId: string): void {
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

  finishTask(id: string, taskId: string): void {
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

  async addTags(id: string, tags: [string]): Promise<void> {
    try {
      const user = await this.get(id);

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

  async addReview(id: string, review: UserReview) {
    try {
      const key = review.like ? 'likes' : 'dislikes';
      const rating = review.like ? {
        'ratings.count': 1,
        'ratings.value': review.rating,
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

  async getFinishedTasks(id, popRefs = []): Promise<Task[]> {
    return this.tasksService.find({
      workerUser: id,
      status: { $in: TASK_STATUSES.FINISHED_VALUES },
    }, popRefs);
  }

  async findAppliedTasks(id, search: TaskSearchDto): Promise<Pagination<Task>> {
    const tasks = await this.offersService.search(search.query ? {
      workerUser: '',
      status: '',
    } : undefined, [ 'creatorUser'], {
      skip: search.pageNo > 0 ? (search.pageNo * search.pageSize) : 0,
      limit: search.pageSize,
    });

    return {
      page: tasks,
      pageNo: search.pageNo,
      pageSize: search.pageSize,
      total: 0,
    };
  }

  async getCreatedTasks(
    id: string,
    search: TaskSearchDto,
  ): Promise<Pagination<MyCreatedTask>> {
    const match = this.tasksService.readSearchQuery(
      Object.assign(search.query || {}, {
        creatorUser: { type: 'eq', value: id },
      }),
    );
    const tasksPagination = await this.tasksService.search(match,
      [ 'workerUser' ],
      search.pageSize,
      search.pageNo,
    );
    const taskOfferCount = await this.offersService
      .countForTasks(tasksPagination.page.map(task => task._id));

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

  async setLastSeen(id: string, dateTime?: Date): Promise<Partial<User>> {
    const doc = {
      lastSeen: (dateTime || new Date()).toUTCString(),
    };
    const resp = await this.MODEL.updateOne({
      _id: id,
    }, doc);

    if (resp.nModified !== 1) {
      throw new NotFoundException(`No user found with id ${id}`);
    }
    return doc;
  }

  async addBadge(id: string, badge: UserCreateBadgeDto): Promise<Badge[]> {
    const user = await this.MODEL.findOneAndUpdate({ _id: id }, {
      $addToSet: {
        badges: badge,
      },
    }, { new: true });

    return user.badges;
  }

  async removeBadge(id: string, badgeName: string): Promise<Badge> {
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

  async getRelatedTasks(id): Promise<Task[]> {
    const user = await this.get(id);
    const { acceptedTasks, appliedTasks, createdTasks, finishedTasks } = user;

    const taskIds =
      [...acceptedTasks, ...appliedTasks, ...createdTasks, ...finishedTasks];

    return this.tasksService.findByIds(taskIds);
  }

  async getReviews(id): Promise<TaskReview[]> {
    const tasks = await this.getFinishedTasks(id, [ 'creatorUser']);

    return tasks.map((task) => ({
      creatorUser: task.creatorUser,
      ...task.creatorRating.toJSON(),
    }));
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return this.MODEL.findOneAndUpdate({ _id: id }, data, { new: true });
  }
}
