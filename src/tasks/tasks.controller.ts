import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { TaskCreateDto } from './dto/task.create.dto';
import { TaskUpdateDto } from './dto/task.update.dto';
import { TasksService } from './tasks.service';
import { Task } from './interfaces/task.interface';
import { Offer } from '../offers/interfaces/offer.interface';
import { Types } from 'mongoose';
import { IdOnlyParams } from '../common/dto/id.params';
import { TaskOfferQuery } from './dto/query/task-offer.query';
import { TaskAcceptedOfferParams } from './dto/params/task-accepted-offer.params';
import { TaskStatusParams } from './dto/params/task-status.params';
import { TaskSeenByUserParams } from './dto/params/task-seen-by-user.params';

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

  @Get(':id/offers')
  async getOffers(
    @Param() params: IdOnlyParams,
    @Query() query: TaskOfferQuery,
  ): Promise<Offer[]> {
    const selector = query.userId ? {
      workerUser: Types.ObjectId(query.userId),
    } : undefined;

    return this.tasksService.getOffers(params.id, selector);
  }

  @Delete(':id/offers')
  async removeOffers(
    @Param() params: IdOnlyParams,
  ): Promise<void> {
    return this.tasksService.removeOffers(params.id);
  }

  @Post(':id/accepted-offer/:offerId')
  async updateAcceptedOffer(
    @Param() params: TaskAcceptedOfferParams,
  ): Promise<Task> {
    return this.tasksService.acceptOffer(params.id, params.acceptedOfferId);
  }

  @Post(':id/status/:status')
  async updateStatus(
    @Param() params: TaskStatusParams,
  ): Promise<Partial<Task>> {
    return this.tasksService.changeStatus(params.id, params.status);
  }

  @Post(':id/seenBy/:userId')
  async seenByUser(
    @Param() params: TaskSeenByUserParams,
  ): Promise<Partial<Task>> {
    return this.tasksService.seenByUser(params.id, params.userId);
  }
}
