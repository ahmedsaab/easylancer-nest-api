import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateDto } from './dto/update.dto';
import { CreateDto } from './dto/create.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './interfaces/task.interface';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel('Task') private readonly taskModel: Model<Task>,
  ) {}

  async findAll(): Promise<Task[]> {
    return await this.taskModel.find().exec();
  }

  async removeAll(): Promise<void> {
    return await this.taskModel.deleteMany({}).exec();
  }

  async get(id: string): Promise<Task> {
    return await this.taskModel.findById(id).exec();
  }

  async remove(id: string): Promise<Task> {
    return await this.taskModel.deleteOne({ _id: id }).exec();
  }

  async create(dto: CreateDto): Promise<Task> {
    try {
      const task = new this.taskModel(dto);
      return await task.save();
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async update(id: string, dto: UpdateDto): Promise<Task> {
    const query = this.taskModel.findOneAndUpdate({ _id: id }, dto, { new: true });
    return await query.exec();
  }
}
