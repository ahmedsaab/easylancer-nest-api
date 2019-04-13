import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateDto } from './dto/update.dto';
import { CreateDto } from './dto/create.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './interfaces/user.interface';
import { Task } from '../tasks/interfaces/task.interface';
import { TasksService } from '../tasks/tasks.service';
import { TaskRating } from '../tasks/interfaces/task-rating.interface';
import { TaskReview } from '../tasks/interfaces/task-review.interface';
import { CreateBadgeDto } from './dto/badges/create.dto';
import { Badge } from './interfaces/bade.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<User>,
    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async removeAll(): Promise<any> {
    return this.userModel.deleteMany({});
  }

  async get(id: string): Promise<User> {
    return this.userModel.findById(id);
  }

  async remove(id: string): Promise<any> {
    return this.userModel.deleteOne({ _id: id });
  }

  async create(dto: CreateDto): Promise<User> {
    try {
      const user = new this.userModel(dto);
      return user.save();
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  applyToTask(id, taskId): void {
    this.userModel.findOneAndUpdate({ _id: id }, {
      $addToSet: {
        appliedTasks: taskId,
      },
    }).catch((error) => {
      console.error(error);
    });
  }

  createTask(id, taskId): void {
    this.userModel.findOneAndUpdate({ _id: id }, {
      $addToSet: {
        createdTasks: taskId,
      },
    }).catch((error) => {
      console.error(error);
    });
  }

  assignTask(id, taskId): void {
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

  async getAcceptedTasks(id): Promise<Task[]> {
    return this.tasksService.find({
      workerUser: id,
    });
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

  async setApproved(id: string, flag: boolean): Promise<Partial<User>> {
    const doc = {
      isApproved: !!flag,
    };
    const resp = await this.userModel.updateOne({
      _id: id,
    }, doc);

    if (resp.nModified !== 1) {
      throw new NotFoundException(`No user found with id ${id}`);
    }
    return doc;
  }

  async addBadge(id: string, badge: CreateBadgeDto): Promise<Badge[]> {
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
    const { acceptedTasks, appliedTasks, createdTasks } = user;

    const taskIds = [...acceptedTasks, ...appliedTasks, ...createdTasks];

    return this.tasksService.findByIds(taskIds);
  }

  async getReviews(id): Promise<TaskReview[]> {
    const tasks = await this.tasksService.find({
      workerUser: id,
    }, [ 'creatorUser']);
    return tasks.map((task) => ({
      creatorUser: task.creatorUser,
      ...task.creatorRating,
    }));
  }

  async exists(id: string): Promise<void> {
    const userExists = (await this.userModel.count({_id: id})) > 0;
    if (!userExists) {
      throw new NotFoundException(`User ${id} doesn't exist`);
    }
  }

  async update(id: string, dto: UpdateDto): Promise<User> {
    return this.userModel.findOneAndUpdate({ _id: id }, dto, { new: true });
  }
}
