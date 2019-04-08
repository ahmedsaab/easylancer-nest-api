import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { CreateDto } from './dto/create.dto';
import { UpdateDto } from './dto/update.dto';
import { UsersService } from './users.service';
import { User } from './interfaces/user.interface';
import { Task } from '../tasks/interfaces/task.interface';
import { TaskReview } from '../tasks/interfaces/task-review.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Only for development
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // Only for development
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

  @Get(':id/tasks/accepted')
  async getAcceptedTasks(
    @Param('id') id: string,
  ): Promise<Task[]> {
    return this.usersService.getAcceptedTasks(id);
  }

  @Get(':id/tasks/created')
  async getCreatedTasks(
    @Param('id') id: string,
  ): Promise<Task[]> {
    return this.usersService.getCreatedTasks(id);
  }

  @Get(':id/tasks')
  async getRelatedTasks(
    @Param('id') id: string,
  ): Promise<Task[]> {
    return this.usersService.getRelatedTasks(id);
  }

  @Get(':id/reviews')
  async getReviews(
    @Param('id') id: string,
  ): Promise<TaskReview[]> {
    return this.usersService.getReviews(id);
  }
}
