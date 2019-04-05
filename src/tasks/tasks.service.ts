import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { UpdateDto } from './dto/update.dto';
import { CreateDto } from './dto/create.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './interfaces/task.interface';
import { UsersService } from '../users/users.service';
import { Offer } from '../offers/interfaces/offer.interface';
import { OffersService } from '../offers/offers.service';

const UPDATE_OPTIONS = { new: true, runValidators: true };
const DEF_PROP = [{
  path: 'creatorUser',
  select: 'firstName lastName likes dislikes imageUrl badges isApproved',
}, {
  path: 'workerUser',
  select: 'firstName lastName likes dislikes imageUrl badges isApproved',
}];

@Injectable()
export class TasksService {
  constructor(
    @InjectModel('Task') private readonly taskModel: Model<Task>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => OffersService))
    private readonly offersService: OffersService,
  ) {}

  async findAll(): Promise<Task[]> {
    return this.taskModel.find()
      .populate(DEF_PROP);
  }

  async removeAll(): Promise<void> {
    return this.taskModel.deleteMany({});
  }

  async get(id: string): Promise<Task> {
    return this.taskModel.findById(id)
      .populate(DEF_PROP);
  }

  async remove(id: string): Promise<Task> {
    return await this.taskModel.deleteOne({ _id: id });
  }

  async create(dto: any): Promise<Task> {
    await this.usersService.exists(dto.creatorUser);
    const task = new this.taskModel(dto);

    await task.save();
    return task.populate(DEF_PROP)
      .execPopulate();
  }

  async exists(id: string): Promise<void> {
    const exists = (await this.taskModel.count({_id: id})) > 0;
    if (!exists) {
      throw new NotFoundException(`Task ${id} doesn't exist`);
    }
  }

  async update(id: string, dto: any): Promise<Task> {
    if (dto.workerUser) {
       await this.usersService.exists(dto.workerUser);
    }
    const task = await this.taskModel.findById(id);

    task.set(dto);
    await task.save(dto);
    return task.populate(DEF_PROP)
      .execPopulate();
  }

  async getOffers(id: string): Promise<Offer[]> {
    return this.offersService.getByTask(id);
  }

  async removeOffers(id: string): Promise<any> {
    return this.offersService.removeByTask(id);
  }
}
