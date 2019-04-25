import { IsDefined, IsMongoId, IsOptional } from 'class-validator';

export class FindOfferQuery {
  @IsDefined()
  @IsMongoId()
  task: string;

  @IsOptional()
  @IsMongoId()
  workerUser: string;
}
