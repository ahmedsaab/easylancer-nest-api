import { Controller, Get, Post, Body, Put, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { UserCreateDto } from './dto/user.create.dto';
import { UserUpdateDto } from './dto/user.update.dto';
import { UsersService } from './users.service';
import { User } from './interfaces/user.interface';
import { Task } from '../tasks/interfaces/task.interface';
import { TaskReview } from '../tasks/interfaces/task-review.interface';
import { UserCreateBadgeDto } from './dto/user.create.badge.dto';
import { Badge } from './interfaces/bade.interface';
import { delay } from '../common/utils/dev-tools';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    // await delay(5000);
    return this.usersService.findAll();
  }

  @Delete()
  async removeAll(): Promise<void> {
    return this.usersService.removeAll();
  }

  @Post()
  async create(
    @Body() dto: UserCreateDto,
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
    @Body() dto: UserUpdateDto,
  ): Promise<User> {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<User> {
    return this.usersService.remove(id);
  }

  @Put(':id/last-seen')
  async updateLastSeen(
    @Param('id') id: string,
  ): Promise<Partial<User>> {
    return this.usersService.setLastSeen(id);
  }

  @Post(':id/badges')
  async addBadge(
    @Param('id') id: string,
    @Body() dto: UserCreateBadgeDto,
  ): Promise<Badge[]> {
    return this.usersService.addBadge(id, dto);
  }

  @Delete(':id/badges/:name')
  async removeBadge(
    @Param('id') id: string,
    @Param('name') badgeName: string,
  ): Promise<Badge> {
    return this.usersService.removeBadge(id, badgeName);
  }

  @Get(':id/tasks/finished')
  async getAcceptedTasks(
    @Param('id') id: string,
  ): Promise<Task[]> {
    return this.usersService.getFinishedTasks(id);
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
