import { Pagination } from '../interfaces/pagination.interface';
import { Document, Model, Schema, Types } from 'mongoose';
import { FilterQuery, QuerySelector } from 'mongodb';

import { ObjectId } from 'mongodb';
import { Filter } from '../interfaces/filter.interface';
import { Query } from '../interfaces/query.interface';

export class MongoDataService<T extends Document> {
  protected readonly DEF_PROP: any[];
  protected readonly MODEL: Model<T>;
  private readonly POPULATION_PROPS: any;
  private readonly SCHEMA_DEFINITION: any;
  private readonly SCHEMA: any;

  constructor(populationProps, schema: Schema, schemaDefinition, model: Model<T>) {
    this.SCHEMA = schema;
    this.SCHEMA_DEFINITION = schemaDefinition;
    this.POPULATION_PROPS = populationProps;
    this.MODEL = model;
    this.DEF_PROP = Object.keys(populationProps).map((key) => ({
      path: key,
      select: populationProps[key],
    }));
  }

  readQuery(property: string, filter: Filter): QuerySelector<string | number | ObjectId> {
    const isObjectId = this.SCHEMA_DEFINITION[property].type.name === 'ObjectId';

    switch (filter.type) {
      case 'eq':
        return {
          $eq: isObjectId ? new ObjectId(filter.value) : filter.value,
        };
      case 'nq':
        return {
          $ne: isObjectId ? new ObjectId(filter.value) : filter.value,
        };
      case 'in':
        return {
          $in: isObjectId ? (filter.values.map(value => new ObjectId(value))) :
            filter.values,
        };
      default:
        throw Error('unexpected MongoDataService filter type');
    }
  }

  readSearchQuery(query: Query = {}): FilterQuery<T> {
    const filter = {};

    Object.entries(query).forEach(([key, value]) => {
      filter[key] = this.readQuery(key, value);
    });

    return filter;
  }

  refsToProps(refs: string[]) {
    const props = [];
    refs.forEach((ref) => {
      if (this.POPULATION_PROPS.hasOwnProperty(ref)) {
        props.push({
          path: ref,
          select: this.POPULATION_PROPS[ref],
        });
      }
    });
    return props;
  }

  async search(
    match: object,
    refs: string[] = [],
    pageSize: number = 100,
    pageNo: number = 0,
  ): Promise<Pagination<T>> {
    const props = this.refsToProps(refs);
    const paths = {};
    const dataPipeLine: any[] = [
      { $match: match },
      { $skip: pageNo * pageSize },
      { $limit: pageSize },
    ];
    const countPipeLine = [
      { $match: match },
      { $count: 'count' },
    ];

    props.forEach(prop => {
      dataPipeLine.push({
        $lookup: {
          from: this.SCHEMA_DEFINITION[prop.path].schema,
          localField: prop.path,
          foreignField: '_id',
          as: prop.path,
        },
      }, {
        $unwind: {
          path: `$${prop.path}`,
          preserveNullAndEmptyArrays: true,
        },
      });
    });

    Object.entries(this.SCHEMA.paths).forEach(([path, value]) => {
      // @ts-ignore
      if (value.options.ref && refs.includes(path)) {
        this.POPULATION_PROPS[path].split(' ').forEach(field => {
          paths[path + '.' + field] = 1;
        });
      } else {
        paths[path] = 1;
      }
    });

    dataPipeLine.push({ $project: paths });

    const search = (
      await this.MODEL.aggregate([
        {
          $facet: {
            dataResult: dataPipeLine,
            countResult: countPipeLine,
          },
        },
      ])
    ) as unknown as [{
      countResult: {
        count: string,
      },
      dataResult: T[],
    }];

    return {
      pageNo,
      pageSize,
      total: search[0].countResult[0] ?
        search[0].countResult[0].count : 0,
      page: search[0].dataResult,
    };
  }
}
