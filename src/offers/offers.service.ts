import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateDto } from './dto/update.dto';
import { CreateDto } from './dto/create.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Offer } from './interfaces/offer.interface';
import { UsersService } from '../users/users.service';
import { TasksService } from '../tasks/tasks.service';

const DEF_PROP = [{
  path: 'workerUser',
  select: 'email firstName lastName likes dislikes imageUrl',
}];

@Injectable()
export class OffersService {
  constructor(
    @InjectModel('Offer')
    private readonly offerModel: Model<Offer>,
    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
  ) {
  }

  async findAll(): Promise<Offer[]> {
    return this.offerModel.find()
      .populate(DEF_PROP);
  }

  async removeAll(): Promise<void> {
    return this.offerModel.deleteMany({});
  }

  async get(id: string): Promise<Offer> {
    return this.offerModel.findById(id)
      .populate(DEF_PROP);
  }

  async remove(id: string): Promise<Offer> {
    return await this.offerModel.deleteOne({ _id: id });
  }

  async create(dto: any): Promise<Offer> {
    await this.usersService.exists(dto.workerUser);
    await this.tasksService.exists(dto.task);
    const offer = new this.offerModel(dto);

    await offer.save();
    return offer;
  }

  async getByTask(taskId) {
    return this.offerModel.find({ task: taskId })
      .populate(DEF_PROP);
  }

  async removeByTask(taskId) {
    return this.offerModel.deleteMany({ task: taskId });
  }

  async update(id: string, dto: any): Promise<Offer> {
    const offer = await this.offerModel.findById(id);

    offer.set(dto);
    await offer.save(dto);
    return offer;
  }
}
