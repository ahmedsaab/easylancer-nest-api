import { IsMongoId } from 'class-validator';

export class TaskOfferParams {
  @IsMongoId()
  id: string;
  @IsMongoId()
  offerId: string;
}
