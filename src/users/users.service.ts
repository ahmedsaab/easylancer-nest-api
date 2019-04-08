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
      return await user.save();
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async applyToTask(id, taskId): Promise<User> {
    return this.userModel.findOneAndUpdate({ _id: id }, {
      $push: {
        appliedTasks: taskId,
      },
    });
  }

  async createTask(id, taskId): Promise<User> {
    return this.userModel.findOneAndUpdate({ _id: id }, {
      $push: {
        createdTasks: taskId,
      },
    });
  }

  async finishTask(id, taskId): Promise<User> {
    return this.userModel.findOneAndUpdate({ _id: id }, {
      $push: {
        finishedTasks: taskId,
      },
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
    const query = this.userModel.findOneAndUpdate({ _id: id }, dto, { new: true });
    return await query.exec();
  }
}
