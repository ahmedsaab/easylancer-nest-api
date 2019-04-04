import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { CreateDto } from './dto/create.dto';
import { UpdateDto } from './dto/update.dto';
import { OffersService } from './offers.service';
import { Offer } from './interfaces/offer.interface';
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  // Only for development
  @Get()
  async findAll(): Promise<Offer[]> {
    return this.offersService.findAll();
  }

  // Only for development
  @Delete()
  async removeAll(): Promise<void> {
    return this.offersService.removeAll();
  }

  @Post()
  async create(
    @Body() dto: CreateDto,
  ): Promise<Offer> {
    return this.offersService.create(dto);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<Offer> {
    return this.offersService.get(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDto,
  ): Promise<Offer> {
    return this.offersService.update(id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<Offer> {
    return this.offersService.remove(id);
  }
}
