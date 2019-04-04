import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateDto } from './dto/update.dto';
import { CreateDto } from './dto/create.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Offer } from './interfaces/offer.interface';
import { UsersService } from '../users/users.service';

const NEW = { new: true };
const DEF_PROP = [{
  path: 'creatorUser',
  select: 'email firstName lastName likes dislikes imageUrl',
}];

@Injectable()
export class OffersService {
  constructor(
    @InjectModel('Offer') private readonly offerModel: Model<Offer>,
    private readonly usersService: UsersService,
  ) {}

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
    const userExists = await this.usersService.exists(dto.creatorUser);
    const offer = new this.offerModel(dto);

    if (userExists) {
      await offer.save();
      return offer.populate(DEF_PROP)
        .execPopulate();
    } else {
      throw new NotFoundException(`User ${dto.creatorUser} doesn't exist`);
    }
  }

  async update(id: string, dto: UpdateDto): Promise<Offer> {
    return this.offerModel.findByIdAndUpdate(id, dto, NEW)
      .populate(DEF_PROP);
  }
}
