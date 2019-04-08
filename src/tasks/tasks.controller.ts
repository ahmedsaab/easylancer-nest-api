import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { CreateDto } from './dto/create.dto';
import { UpdateDto } from './dto/update.dto';
import { TasksService } from './tasks.service';
import { Task } from './interfaces/task.interface';
import { Offer } from '../offers/interfaces/offer.interface';
import { Types } from 'mongoose';

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
    @Body() dto: CreateDto,
  ): Promise<Task> {
    return this.tasksService.create(dto);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<Task> {
    return this.tasksService.getPopulate(id);
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

  @Get(':id/offers')
  async getOffers(
    @Param('id') id: string,
    @Query('userId') userId?: string,
  ): Promise<Offer[]> {
    return this.tasksService.getOffers(id, {
      workerUser: Types.ObjectId(userId),
    });
  }

  @Delete(':id/offers')
  async removeOffers(
    @Param('id') id: string,
  ): Promise<void> {
    return this.tasksService.removeOffers(id);
  }
}
