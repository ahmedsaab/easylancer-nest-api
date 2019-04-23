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
import { USER_SUMMARY_PROP } from '../common/schema/constants';

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
    return this.taskModel.findById(id);
  }

  async remove(id: string): Promise<any> {
    return this.taskModel.deleteOne({ _id: id });
  }

  async create(data: any): Promise<Task> {
    await this.usersService.exists(data.creatorUser);
    const task = new this.taskModel(data);

    await task.save();
    this.usersService.createTask(data.creatorUser, task._id);

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
      return this.taskModel.find(query).populate(this.refsToProps(refs));
    } else {
      return this.taskModel.find(query);
    }
  }

  async userUpdate(id: string, userId: string, dto: TaskUpdateDto): Promise<Task> {
    const task: Task = await this.taskModel.findById(id);

    if (task == null) {
      throw new NotFoundException(`No task found with id ${id}`);
    } else if (!task.creatorUser.equals(userId)) {
      throw new UnauthorizedException(
        `User ${userId} is not authorized to update this task`,
      );
    } else {
      task.set(dto);
      if (dto.location) {
        task.location.set(dto.location);
      }
      await task.save();

      return task;
    }
  }

  async getOffers(id: string, query?: Partial<Offer>): Promise<Offer[]> {
    return this.offersService.findByTask(id, query);
  }

  async removeOffers(id: string): Promise<any> {
    return this.offersService.removeByTask(id);
  }

  async acceptOffer(id: string, offerId: string): Promise<Task> {
    // TODO: Get offer byId
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
      // TODO: Check task status before assigning
      const offer = offers[0];

      task.acceptedOffer = new Types.ObjectId(offerId);
      task.workerUser = offer.workerUser;
      await task.save();
      // TODO: Change task status to 'accepted' if successful
      this.usersService.assignTask(offer.workerUser, task.id);

      return task;
    }
  }

  async changeStatus(id: string, status: string): Promise<Partial<Task>> {
    // TODO: check if the new status change is valid given the current status
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

  async createOffer(id: string, data: any): Promise<Offer> {
    const { workerUser } = data;

    const [ task ] = await Promise.all([
      this.get(id),
      this.usersService.exists(workerUser),
    ]);

    data.task = id;

    if (task.creatorUser.equals(workerUser)) {
      throw new MethodNotAllowedException(
        'Users cannot make an offer to their own tasks',
      );
    } else if (task.status !== 'open') {
      throw new MethodNotAllowedException(
        `Task is closed for offers: status = ${task.status}`,
      );
    }
    const offer = await this.offersService.create(data);

    this.usersService.applyToTask(workerUser, id);

    return offer;
  }

  async userUpdateOffer(id: string, offerId: string, userId: string, dto: OfferUpdateDto): Promise<Offer> {
    const [ task, offer ] = await Promise.all([
      this.get(id),
      this.offersService.get(offerId),
      this.usersService.exists(userId),
    ]);

    if (!offer.workerUser.equals(userId)) {
      throw new UnauthorizedException(
        `User ${userId} is not authorized to update this offer`,
      );
    } else if (task.status !== 'open') {
      throw new MethodNotAllowedException(
        `Task is closed for offers: status = ${task.status}`,
      );
    }
    offer.set(dto);
    await offer.save();

    return offer;
  }
}
