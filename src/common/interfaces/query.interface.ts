import { Filter } from './filter.interface';

export interface Query {
  [key: string]: Filter;
}
