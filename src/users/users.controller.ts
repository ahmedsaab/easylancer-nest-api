import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { UserCreateDto } from './dto/user.create.dto';
import { UserUpdateDto } from './dto/user.update.dto';
import { UsersService } from './users.service';
import { User, UserDocument } from './interfaces/user.interface';
import { MyAppliedTask, MyCreatedTask, Task } from '../tasks/interfaces/task.interface';
import { TaskReview } from '../tasks/interfaces/task-review.interface';
import { UserCreateBadgeDto } from './dto/user.create.badge.dto';
import { Badge } from './interfaces/bade.interface';
import { FindUserQuery } from './dto/query/find-user.query';
import { TaskSearchDto } from '../tasks/dto/search/task.search.dto';
import { Pagination } from '../common/interfaces/pagination.interface';
// import { delay } from '../common/utils/dev-tools';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async find(
    @Query() query: FindUserQuery,
  ): Promise<User[]> {
    // await delay(5000);
    return this.usersService.find(query);
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
    @Param('id') id: ObjectId,
  ): Promise<UserDocument> {
    return this.usersService.get(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: ObjectId,
    @Body() dto: UserUpdateDto,
  ): Promise<User> {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: ObjectId,
  ): Promise<User> {
    return this.usersService.remove(id);
  }

  @Put(':id/last-seen')
  async updateLastSeen(
    @Param('id') id: ObjectId,
  ): Promise<Partial<User>> {
    return this.usersService.setLastSeen(id);
  }

  @Post(':id/badges')
  async addBadge(
    @Param('id') id: ObjectId,
    @Body() dto: UserCreateBadgeDto,
  ): Promise<Badge[]> {
    return this.usersService.addBadge(id, dto);
  }

  @Delete(':id/badges/:name')
  async removeBadge(
    @Param('id') id: ObjectId,
    @Param('name') badgeName: string,
  ): Promise<Badge> {
    return this.usersService.removeBadge(id, badgeName);
  }

  @Post(':id/tasks/applied')
  async searchAppliedTasks(
    @Param('id') id: string,
    @Body() search: TaskSearchDto,
  ): Promise<Pagination<MyAppliedTask>> {
    return this.usersService.searchAppliedTasks(id, search);
  }

  @Post(':id/tasks/created')
  async getCreatedTasks(
    @Param('id') id: string,
    @Body() search: TaskSearchDto,
  ): Promise<Pagination<MyCreatedTask>> {
    return this.usersService.searchCreatedTasks(id, search);
  }

  @Get(':id/tasks')
  async getRelatedTasks(
    @Param('id') id: ObjectId,
  ): Promise<Task[]> {
    return this.usersService.getRelatedTasks(id);
  }

  @Get(':id/reviews')
  async getReviews(
    @Param('id') id: ObjectId,
  ): Promise<TaskReview[]> {
    return this.usersService.getReviews(id);
  }
}
