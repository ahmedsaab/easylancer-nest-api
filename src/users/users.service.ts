import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserCreateDto } from './dto/user.create.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './interfaces/user.interface';
import { Task } from '../tasks/interfaces/task.interface';
import { TasksService } from '../tasks/tasks.service';
import { TaskReview } from '../tasks/interfaces/task-review.interface';
import { UserCreateBadgeDto } from './dto/user.create.badge.dto';
import { Badge } from './interfaces/bade.interface';
import { TASK_STATUSES } from '../common/schema/constants';
import { FindUserQuery } from './dto/query/find-user.query';
import { UserReview } from './interfaces/user-review.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<User>,
    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,
  ) {}

  async find(query?: FindUserQuery): Promise<User[]> {
    return this.userModel.find(query);
  }

  async removeAll(): Promise<any> {
    return this.userModel.deleteMany({});
  }

  async get(id: string): Promise<User> {
    const user: User = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException(`No user found with id ${id}`);
    }

    return user;
  }

  async remove(id: string): Promise<any> {
    return this.userModel.deleteOne({ _id: id });
  }

  async create(dto: UserCreateDto): Promise<User> {
    try {
      const user = new this.userModel(dto);
      return user.save();
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  applyToTask(id: string, taskId: string): void {
    this.userModel.findOneAndUpdate({ _id: id }, {
      $addToSet: {
        appliedTasks: taskId,
      },
    }).catch((error) => {
      console.error(error);
    });
  }

  withdrawFromTask(id: string, taskId: string): void {
    this.userModel.findOneAndUpdate({ _id: id }, {
      $pull: {
        appliedTasks: taskId,
      },
    }).catch((error) => {
      console.error(error);
    });
  }

  createTask(id: string, taskId: string): void {
    this.userModel.findOneAndUpdate({ _id: id }, {
      $addToSet: {
        createdTasks: taskId,
      },
    }).catch((error) => {
      console.error(error);
    });
  }

  assignTask(id: string, taskId: string): void {
    this.userModel.findOneAndUpdate({ _id: id }, {
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
    this.userModel.findOneAndUpdate({ _id: id }, {
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
      await this.userModel.findByIdAndUpdate(id, {
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

  async getCreatedTasks(id): Promise<Task[]> {
    return this.tasksService.find({
      creatorUser: id,
    });
  }

  async setLastSeen(id: string, dateTime?: Date): Promise<Partial<User>> {
    const doc = {
      lastSeen: (dateTime || new Date()).toUTCString(),
    };
    const resp = await this.userModel.updateOne({
      _id: id,
    }, doc);

    if (resp.nModified !== 1) {
      throw new NotFoundException(`No user found with id ${id}`);
    }
    return doc;
  }

  async addBadge(id: string, badge: UserCreateBadgeDto): Promise<Badge[]> {
    const user = await this.userModel.findOneAndUpdate({ _id: id }, {
      $addToSet: {
        badges: badge,
      },
    }, { new: true });

    return user.badges;
  }

  async removeBadge(id: string, badgeName: string): Promise<Badge> {
    const resp = await this.userModel.updateOne({
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
    return this.userModel.findOneAndUpdate({ _id: id }, data, { new: true });
  }
}
