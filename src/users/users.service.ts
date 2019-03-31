import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
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

  async create(dto: CreateUserDto): Promise<User> {
    try {
      const createdUser = new this.userModel(dto);
      return await createdUser.save();
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const query = this.userModel.findOneAndUpdate({ _id: id }, dto, { new: true });
    return await query.exec();
  }
}
