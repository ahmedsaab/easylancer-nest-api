import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
  MethodNotAllowedException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task } from './interfaces/task.interface';
import { UsersService } from '../users/users.service';
import { Offer } from '../offers/interfaces/offer.interface';
import { OffersService } from '../offers/offers.service';
import { TaskUpdateDto } from './dto/task.update.dto';
import { OfferCreateDto } from '../offers/dto/offer.create.dto';
import { OfferUpdateDto } from '../offers/dto/offer.update.dto';
import { MongoDataService } from '../common/providers/mongo-data.service';
import { USER_SUMMARY_PROP, TASK_STATUSES } from '../common/schema/constants';
import { TaskCreateDto } from './dto/task.create.dto';

// const UPDATE_OPTIONS = { new: true, runValidators: true };
const POPULATION_PROPS = {
  creatorUser: USER_SUMMARY_PROP,
  workerUser: USER_SUMMARY_PROP,
};

@Injectable()
export class TasksService extends MongoDataService {
  constructor(
    @InjectModel('Task')
    private readonly taskModel: Model<Task>,
    @Inject(forwardRef(() => OffersService))
    private readonly offersService: OffersService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {
    super(POPULATION_PROPS);
  }

  async findAll(): Promise<Task[]> {
    return this.taskModel.find();
  }

  async removeAll(): Promise<any> {
    return this.taskModel.deleteMany({});
  }

  async getPopulate(id: string): Promise<Task> {
    const task = await this.taskModel.findById(id)
      .populate(this.DEF_PROP);

    if (!task) {
      throw new NotFoundException(`task with id ${id} not found`);
    }

    return task;
  }

  async get(id: string): Promise<Task> {
    const task: Task = await this.taskModel.findById(id);

    if (!task) {
      throw new NotFoundException(`No task found with id ${id}`);
    }

    return task;
  }

  async remove(id: string): Promise<any> {
    return this.taskModel.deleteOne({ _id: id });
  }

  async create(data: TaskCreateDto): Promise<Task> {
    await this.usersService.get(data.creatorUser);
    const task = new this.taskModel(data);

    await task.save();
    this.usersService.createTask(data.creatorUser, task._id);

    return task;
  }

  async findByIds(ids): Promise<Task[]> {
    const objectIds = ids.map(id => new Types.ObjectId(id));

    return this.taskModel.find({ _id: { $in: objectIds } });
  }

  async find(query, refs?: string[]): Promise<Task[]> {
    if (refs) {
      return this.taskModel.find(query).populate(this.refsToProps(refs));
    } else {
      return this.taskModel.find(query);
    }
  }

  async update(id: string, data: TaskUpdateDto): Promise<Task> {
    const task: Task = await this.get(id);

    task.set(data);
    if (
      (data.creatorRating || data.workerRating) &&
      !TASK_STATUSES.REVIEWABLE_VALUES.includes(task.status)
    ) {
      throw new MethodNotAllowedException(
        `Cannot add a rating for a task in this status, status = ${task.status}`,
      );
    }
    if (data.location) {
      task.location.set(data.location);
    }
    if (data.creatorRating) {
      task.creatorRating.set(data.creatorRating);
    }
    if (data.workerRating) {
      task.workerRating.set(data.workerRating);
    }
    if (data.status) {
      await this.changeStatus(task, data.status);
    } else {
      await task.save();
    }

    return task;
  }

  async getOffers(id: string, query?: Partial<Offer>): Promise<Offer[]> {
    return this.offersService.findByTask(id, query);
  }

  async removeOffers(id: string): Promise<any> {
    return this.offersService.removeByTask(id);
  }

  async acceptOffer(id: string, offerId: string): Promise<Task> {
    const [ task, offer ] = await Promise.all([
      this.get(id),
      this.offersService.get(offerId),
    ]);

    if (task.acceptedOffer !== null) {
      throw new MethodNotAllowedException('Task already has an accepted offer');
    } else if (task.status !== 'open') {
      throw new MethodNotAllowedException(`Task is not assignable, status: ${task.status}`);
    }

    task.acceptedOffer = new Types.ObjectId(offerId);
    task.workerUser = offer.workerUser;
    await this.changeStatus(task, 'accepted');
    this.usersService.assignTask(offer.workerUser, task.id);

    return task;
  }

  async changeStatus(idOrTask: string | Task, status: string): Promise<Task> {
    const task = typeof idOrTask === 'string' ?
      await this.get(idOrTask) : idOrTask;

    if (!TASK_STATUSES.isValidNext(task.status, status)) {
      throw new MethodNotAllowedException(
        `Cannot change task to this status, current status = ${task.status}`,
      );
    }
    task.status = status;
    await task.save();
    if (TASK_STATUSES.FINISHED_VALUES.includes(status)) {
      this.usersService.finishTask(task.workerUser, task.id);
    }

    return task;
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

  // TODO: find out what to do with this function, recommend to move to offerService
  // TODO: change the param "data" type from any to a DTO class
  async createOffer(id: string, data: any): Promise<Offer> {
    const { workerUser } = data;

    const [ task ] = await Promise.all([
      this.get(id),
      this.usersService.get(workerUser),
    ]);

    data.task = id;

    if (task.creatorUser.equals(workerUser)) {
      throw new MethodNotAllowedException(
        'Users cannot make an offer to their own tasks',
      );
    } else if (task.status !== 'open' || task.workerUser) {
      throw new MethodNotAllowedException(
        `Task is closed for offers: status = ${task.status}, workerUser = ${task.workerUser}`,
      );
    }
    const offer = await this.offersService.create(data);

    this.usersService.applyToTask(workerUser, id);

    return offer;
  }

  async updateOffer(id: string, offerId: string, data: OfferUpdateDto): Promise<Offer> {
    const [ task, offer ] = await Promise.all([
      this.get(id),
      this.offersService.get(offerId),
    ]);

    if (task.status !== 'open') {
      throw new MethodNotAllowedException(
        `Task is closed for offers: status = ${task.status}`,
      );
    }
    offer.set(data);
    await offer.save();

    return offer;
  }
}
