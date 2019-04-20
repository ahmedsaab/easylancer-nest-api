import { Controller, Get, Post, Body, Put, Param, Delete, Query, Headers, UseGuards, Req } from '@nestjs/common';
import { TaskCreateDto } from './dto/task.create.dto';
import { TaskUpdateDto } from './dto/task.update.dto';
import { TasksService } from './tasks.service';
import { Task } from './interfaces/task.interface';
import { Offer } from '../offers/interfaces/offer.interface';
import { Types } from 'mongoose';
import { IdOnlyParams } from '../common/dto/id.params';
import { TaskOfferQuery } from './dto/query/task-offer.query';
import { TaskOfferParams } from './dto/params/task-offer.params';
import { TaskStatusParams } from './dto/params/task-status.params';
import { TaskSeenByUserParams } from './dto/params/task-seen-by-user.params';
import { AuthGuard } from '@nestjs/passport';
import { OfferCreateDto } from '../offers/dto/offer.create.dto';

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

  @Get(':id/view')
  async findOne(
    @Param() params: IdOnlyParams,
  ): Promise<Task> {
    return this.tasksService.getPopulate(params.id);
  }

  @Put(':id')
  @UseGuards(AuthGuard())
  async update(
    @Req() req,
    @Param() params: IdOnlyParams,
    @Body() dto: TaskUpdateDto,
  ): Promise<Task> {
    return this.tasksService.userUpdate(params.id, req.user.id, dto);
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

  @Post(':id/offers')
  async createOffer(
    @Param() params: IdOnlyParams,
    @Body() dto: OfferCreateDto,
  ): Promise<Offer> {
    return this.tasksService.createOffer(params.id, dto);
  }

  @Put(':id/offers/:offerId')
  @UseGuards(AuthGuard())
  async updateOffer(
    @Req() req,
    @Param() params: TaskOfferParams,
    @Body() dto: OfferCreateDto,
  ): Promise<Offer> {
    return this.tasksService.userUpdateOffer(params.id, params.offerId, req.user.id, dto);
  }

  @Delete(':id/offers')
  async removeOffers(
    @Param() params: IdOnlyParams,
  ): Promise<void> {
    return this.tasksService.removeOffers(params.id);
  }

  @Post(':id/offers/:offerId/accept')
  async updateAcceptedOffer(
    @Param() params: TaskOfferParams,
  ): Promise<Task> {
    return this.tasksService.acceptOffer(params.id, params.offerId);
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
