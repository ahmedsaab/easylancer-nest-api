import { TaskSchemaDefinition, TasksCollectionName } from '../../tasks/schemas/task.schema';
import { UserSchemaDefinition, UsersCollectionName } from '../../users/schemas/user.schema';
import { OfferSchemaDefinition, OffersCollectionName } from '../../offers/schemas/offer.schema';

export const SCHEMAS = {
  Task: {
    name: TasksCollectionName,
    definition: TaskSchemaDefinition,
  },
  User: {
    name: UsersCollectionName,
    definition: UserSchemaDefinition,
  },
  Offer: {
    name: OffersCollectionName,
    definition: OfferSchemaDefinition,
  },
};
