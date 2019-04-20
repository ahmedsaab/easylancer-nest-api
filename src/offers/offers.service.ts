import { BadRequestException, forwardRef, HttpException, Inject, Injectable, MethodNotAllowedException, NotFoundException } from '@nestjs/common';
import { OfferUpdateDto } from './dto/offer.update.dto';
import { OfferCreateDto } from './dto/offer.create.dto';
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

  async removeAll(): Promise<any> {
    return this.offerModel.deleteMany({});
  }

  async get(id: string): Promise<Offer> {
    const offer = await this.offerModel.findById(id);

    if (!offer) {
      throw new NotFoundException(`No offer found with id: ${id}`);
    }
    return offer;
  }

  async remove(id: string): Promise<any> {
    return await this.offerModel.deleteOne({ _id: id });
  }

  async create(dto: OfferCreateDto): Promise<Offer> {
    const offer = new this.offerModel(dto);

    await offer.save();

    return offer;
  }

  async findByTask(taskId, query?: Partial<Offer>): Promise<Offer[]> {
    return this.offerModel.find({ task: taskId, ...query })
      .populate(DEF_PROP);
  }

  async find(query?: Partial<Offer>): Promise<Offer[]> {
    return this.offerModel.find(query);
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
