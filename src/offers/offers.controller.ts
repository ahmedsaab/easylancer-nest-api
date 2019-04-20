import { Controller, Get, Param, Delete } from '@nestjs/common';
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

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<Offer> {
    return this.offersService.remove(id);
  }
}
