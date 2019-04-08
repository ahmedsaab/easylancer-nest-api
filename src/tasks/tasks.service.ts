import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { UpdateDto } from './dto/update.dto';
import { CreateDto } from './dto/create.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './interfaces/task.interface';
import { UsersService } from '../users/users.service';
import { Offer } from '../offers/interfaces/offer.interface';
import { OffersService } from '../offers/offers.service';
import * as mongoose from 'mongoose';

const propsToArray = (fields) => {
  return Object.keys(fields).map((fieldName) => {
    const fieldProps = fields[fieldName];
    return {
      path: fieldName,
      select: fieldProps,
    };
  });
};

const refsToProps = (refs: string[]) => {
  const props = [];
  refs.forEach((ref) => {
    if (POPULATION_PORPS.hasOwnProperty(ref)) {
      props.push({
        path: ref,
        select: POPULATION_PORPS[ref],
      });
    }
  });
  return props;
};

const UPDATE_OPTIONS = { new: true, runValidators: true };
const POPULATION_PORPS = {
  creatorUser: 'firstName lastName likes dislikes imageUrl badges isApproved',
  workerUser: 'firstName lastName likes dislikes imageUrl badges isApproved',
};
const DEF_PROP = propsToArray(POPULATION_PORPS);

@Injectable()
export class TasksService {
  constructor(
    @InjectModel('Task')
    private readonly taskModel: Model<Task>,
    @Inject(forwardRef(() => OffersService))
    private readonly offersService: OffersService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async findAll(): Promise<Task[]> {
    return this.taskModel.find()
      .populate(DEF_PROP);
  }

  async removeAll(): Promise<any> {
    return this.taskModel.deleteMany({});
  }

  async getPopulate(id: string): Promise<Task> {
    return this.taskModel.findById(id)
      .populate(DEF_PROP);
  }

  async get(id: string): Promise<Task> {
    return this.taskModel.findById(id);
  }

  async remove(id: string): Promise<any> {
    return this.taskModel.deleteOne({ _id: id });
  }

  async create(dto: any): Promise<Task> {
    await this.usersService.exists(dto.creatorUser);
    const task = new this.taskModel(dto);

    await task.save();
    this.usersService.createTask(dto.creatorUser, task._id).catch((error) => {
      console.error(error);
    });

    return task.populate(DEF_PROP)
      .execPopulate();
  }

  async exists(id: string): Promise<void> {
    const exists = (await this.taskModel.count({_id: id})) > 0;
    if (!exists) {
      throw new NotFoundException(`Task ${id} doesn't exist`);
    }
  }

  async findByIds(ids): Promise<Task[]> {
    const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));

    return this.taskModel.find({ _id: { $in: objectIds } });
  }

  async find(query, refs?: string[]): Promise<Task[]> {
    if (refs) {
      return this.taskModel.find(query).populate(refsToProps(refs));
    } else {
      return this.taskModel.find(query);
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

  async getOffers(id: string, query?: Partial<Offer>): Promise<Offer[]> {
    return this.offersService.findByTask(id, query);
  }

  async removeOffers(id: string): Promise<any> {
    return this.offersService.removeByTask(id);
  }
}
