import { Controller, Get, Post, Body, Put, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { CreateDto } from './dto/create.dto';
import { UpdateDto } from './dto/update.dto';
import { UsersService } from './users.service';
import { User } from './interfaces/user.interface';
import { Task } from '../tasks/interfaces/task.interface';
import { TaskReview } from '../tasks/interfaces/task-review.interface';
import { UpdateIsApprovedDto } from './dto/update.is-approved.dto';
import { CreateBadgeDto } from './dto/badges/create.dto';
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

  @Put(':id/last-seen')
  async updateLastSeen(
    @Param('id') id: string,
  ): Promise<Partial<User>> {
    return this.usersService.setLastSeen(id);
  }

  @Put(':id/is-approved')
  async updateIsApproved(
    @Param('id') id: string,
    @Body() dto: UpdateIsApprovedDto,
  ): Promise<Partial<User>> {
    return this.usersService.setApproved(id, dto.isApproved);
  }

  @Post(':id/badges')
  async addBadge(
    @Param('id') id: string,
    @Body() dto: CreateBadgeDto,
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
