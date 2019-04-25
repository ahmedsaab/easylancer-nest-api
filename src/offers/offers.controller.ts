import { Controller, Get, Param, Delete, Query, Post, Body, Put } from '@nestjs/common';
import { OffersService } from './offers.service';
import { Offer } from './interfaces/offer.interface';
import { IdOnlyParams } from '../common/dto/id.params';
import { OfferCreateDto } from './dto/offer.create.dto';
import { FindOfferQuery } from './dto/query/find-offer.query';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  async find(
    @Query() query: FindOfferQuery,
  ): Promise<Offer[]> {
    return this.offersService.find(query);
  }

  @Get('/view')
  async findPopulated(
    @Query() query: FindOfferQuery,
  ): Promise<Offer[]> {
    return this.offersService.find(query, ['workerUser']);
  }

  @Delete()
  async removeAll(
    @Query() query: FindOfferQuery,
  ): Promise<any> {
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
    @Param('id') id: string,
  ): Promise<Offer> {
    return this.offersService.remove(id);
  }
}
