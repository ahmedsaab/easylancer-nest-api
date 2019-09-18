import { Controller, Get, Param, Delete, Query, Post, Body, Put } from '@nestjs/common';
import { OffersService } from './offers.service';
import { Offer, OfferWithWorker } from './interfaces/offer.interface';
import { IdOnlyParams } from '../common/dto/id.params';
import { OfferCreateDto } from './dto/offer.create.dto';
import { FindOfferQuery } from './dto/query/find-offer.query';
// import { delay } from '../common/utils/dev-tools';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  async find(
    @Query() query: FindOfferQuery,
  ): Promise<Offer[]> {
    return this.offersService.find<Offer>(query);
  }

  @Delete()
  async removeAll(
    @Query() query: FindOfferQuery,
  ): Promise<Offer[]> {
    return this.offersService.removeMany(query);
  }

  @Post()
  async create(
    @Body() dto: OfferCreateDto,
  ): Promise<Offer> {
    return this.offersService.create(dto);
  }

  @Put(':id')
  async update(
    @Param() params: IdOnlyParams,
    @Body() dto: OfferCreateDto,
  ): Promise<Offer> {
    return this.offersService.update(params.id, dto);
  }

  @Delete(':id')
  async remove(
    @Param() params: IdOnlyParams,
  ): Promise<Offer> {
    return this.offersService.remove(params.id);
  }

  @Get('/view')
  async findView(
    @Query() query: FindOfferQuery,
  ): Promise<OfferWithWorker[]> {
    // await delay(5000);
    return this.offersService.find<OfferWithWorker>(query, ['workerUser']);
  }
}
