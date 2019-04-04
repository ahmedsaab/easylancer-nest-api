import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateDto } from './dto/update.dto';
import { CreateDto } from './dto/create.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async removeAll(): Promise<void> {
    return await this.userModel.deleteMany({}).exec();
  }

  async get(id: string): Promise<User> {
    return await this.userModel.findById(id).exec();
  }

  async remove(id: string): Promise<User> {
    return await this.userModel.deleteOne({ _id: id }).exec();
  }

  async create(dto: CreateDto): Promise<User> {
    try {
      const user = new this.userModel(dto);
      return await user.save();
    } catch (e) {
      throw new BadRequestException(e);
    }
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
