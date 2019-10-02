import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { TaskCreateDto } from './dto/task.create.dto';
import { TaskUpdateDto } from './dto/task.update.dto';
import { TasksService } from './tasks.service';
import { Task, TaskDocument, TaskView, TaskWithCreator } from './interfaces/task.interface';
import { IdOnlyParams } from '../common/dto/id.params';
import { TaskSeenByUserParams } from './dto/params/task-seen-by-user.params';
import { TaskSearchDto } from './dto/search/task.search.dto';
import { Pagination } from '../common/interfaces/pagination.interface';
// import { delay } from '../common/utils/dev-tools';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Only for development
  @Get('search')
  async findAll(): Promise<TaskWithCreator[]> {
    return this.tasksService.findAll();
  }

  // Only for development
  @Post('search2')
  async search(
    @Body() search: TaskSearchDto,
  ): Promise<Pagination<TaskView>> {
    return this.tasksService.search<TaskView>(
      this.tasksService.readSearchQuery(search.query),
      [ 'workerUser', 'creatorUser' ],
      search.pageSize,
      search.pageNo,
    );
  }

  // Only for development
  @Delete()
  async removeAll(): Promise<any> {
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

  @Get(':id/view')
  async findOneView(
    @Param() params: IdOnlyParams,
  ): Promise<TaskView> {
    return this.tasksService.getView(params.id);
  }

  @Post(':id/seenBy/:userId')
  async seenByUser(
    @Param() params: TaskSeenByUserParams,
  ): Promise<Partial<TaskDocument>> {
    return this.tasksService.seenByUser(params.id, params.userId);
  }
}
