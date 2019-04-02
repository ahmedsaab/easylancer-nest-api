import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { CreateDto } from './dto/create.dto';
import { UpdateDto } from './dto/update.dto';
import { UsersService } from './users.service';
import { User } from './interfaces/user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Only for development
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Delete()
  async removeAll(): Promise<void> {
    return this.usersService.removeAll();
  }

  @Post()
  async create(
    @Body() dto: CreateDto,
  ): Promise<User> {
    return this.usersService.create(dto);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<User> {
    return this.usersService.get(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDto,
  ): Promise<User> {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<User> {
    return this.usersService.remove(id);
  }
}
