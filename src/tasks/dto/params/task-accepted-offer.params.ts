import { IsMongoId } from 'class-validator';

export class TaskAcceptedOfferParams {
  @IsMongoId()
  id: string;
  @IsMongoId()
  acceptedOfferId: string;
}
