import { IsMongoId } from 'class-validator';

export class IdOnlyParams {
  @IsMongoId()
  id: string;
}
