import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef, MethodNotAllowedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task } from './interfaces/task.interface';
import { UsersService } from '../users/users.service';
import { Offer } from '../offers/interfaces/offer.interface';
import { OffersService } from '../offers/offers.service';

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
const DEF_PROP = refsToProps(Object.keys(POPULATION_PORPS));

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
    const task = await this.taskModel.findById(id)
      .populate(DEF_PROP);

    if (!task) {
      throw new NotFoundException(`task with id ${id} not found`);
    }
    return task;
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
    this.usersService.createTask(dto.creatorUser, task._id);

    return task;
  }

  async exists(id: string): Promise<void> {
    const exists = (await this.taskModel.count({_id: id})) > 0;
    if (!exists) {
      throw new NotFoundException(`Task ${id} doesn't exist`);
    }
  }

  async findByIds(ids): Promise<Task[]> {
    const objectIds = ids.map(id => new Types.ObjectId(id));

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
    return task;
  }

  async getOffers(id: string, query?: Partial<Offer>): Promise<Offer[]> {
    return this.offersService.findByTask(id, query);
  }

  async removeOffers(id: string): Promise<any> {
    return this.offersService.removeByTask(id);
  }

  async acceptOffer(id: string, offerId: string): Promise<Task> {
    const [ task, offers ] = await Promise.all([
      this.get(id),
      this.offersService.find({
        task: Types.ObjectId(id),
        _id: offerId,
      }),
    ]);

    if (task.acceptedOffer !== null) {
      throw new MethodNotAllowedException('Task already has an accepted offer');
    } else if (offers.length === 0) {
      throw new BadRequestException('Offer doesn\'t exists on this task');
    } else {
      const offer = offers[0];

      task.acceptedOffer = new Types.ObjectId(offerId);
      await task.save();
      this.usersService.assignTask(offer.workerUser, task.id);

      return task;
    }
  }

  async changeStatus(id: string, status: string): Promise<Partial<Task>> {
    // TODO: check if the status change is valid given the current status
    const doc = { status };
    const resp = await this.taskModel.updateOne({
      _id: id,
    }, doc);

    if (resp.nModified !== 1) {
      throw new NotFoundException(`No task found with id ${id}`);
    }
    return doc;
  }

  async seenByUser(id: string, userId: string): Promise<Partial<Task>> {
    const user = await this.taskModel.findOneAndUpdate({ _id: id }, {
      $addToSet: {
        seenBy: userId,
      },
    }, { new: true });

    return user.seenBy.map((objectId: Types.ObjectId) =>
      objectId.toString(),
    );
  }
}
