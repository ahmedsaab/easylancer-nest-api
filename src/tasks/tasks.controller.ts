import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { CreateDto } from './dto/create.dto';
import { UpdateDto } from './dto/update.dto';
import { TasksService } from './tasks.service';
import { Task } from './interfaces/task.interface';
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Only for development
  @Get()
  async findAll(): Promise<Task[]> {
    return this.tasksService.findAll();
  }

  @Delete()
  async removeAll(): Promise<void> {
    return this.tasksService.removeAll();
  }

  @Post()
  async create(
    @Body() dto: CreateDto,
  ): Promise<Task> {
    return this.tasksService.create(dto);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<Task> {
    return this.tasksService.get(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDto,
  ): Promise<Task> {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<Task> {
    return this.tasksService.remove(id);
  }
}
