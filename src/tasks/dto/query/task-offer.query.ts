import { IsMongoId } from 'class-validator';

export class TaskOfferQuery {
  @IsMongoId()
  userId: string;
}
