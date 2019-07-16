import { Controller, Get, Post, Body, Put, Param, Delete, Query, Headers, UseGuards, Req } from '@nestjs/common';
import { TaskCreateDto } from './dto/task.create.dto';
import { TaskUpdateDto } from './dto/task.update.dto';
import { TasksService } from './tasks.service';
import { Task } from './interfaces/task.interface';
import { IdOnlyParams } from '../common/dto/id.params';
import { TaskSeenByUserParams } from './dto/params/task-seen-by-user.params';
import { delay } from '../common/utils/dev-tools';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Only for development
  @Get()
  async findAll(): Promise<Task[]> {
    return this.tasksService.findAll();
  }

  // Only for development
  @Delete()
  async removeAll(): Promise<void> {
    return this.tasksService.removeAll();
  }

  @Post()
  async create(
    @Body() dto: TaskCreateDto,
  ): Promise<Task> {
    return this.tasksService.create(dto);
  }

  @Get(':id')
  async findOne(
    @Param() params: IdOnlyParams,
  ): Promise<Task> {
    return this.tasksService.get(params.id);
  }

  @Get(':id/view')
  async findOneView(
    @Param() params: IdOnlyParams,
  ): Promise<Task> {
    return this.tasksService.getPopulate(params.id);
  }

  @Put(':id')
  async update(
    @Param() params: IdOnlyParams,
    @Body() dto: TaskUpdateDto,
  ): Promise<Task> {
    return this.tasksService.update(params.id, dto);
  }

  @Delete(':id')
  async remove(
    @Param() params: IdOnlyParams,
  ): Promise<Task> {
    return this.tasksService.remove(params.id);
  }

  @Post(':id/seenBy/:userId')
  async seenByUser(
    @Param() params: TaskSeenByUserParams,
  ): Promise<Partial<Task>> {
    return this.tasksService.seenByUser(params.id, params.userId);
  }
}
