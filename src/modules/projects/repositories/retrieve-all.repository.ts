import type { IAggregateOutput, IAggregateRepository, IDatabase, IPipeline, IQuery } from '@point-hub/papi'
import { addDays } from 'date-fns'

import { collectionName } from '../entity'

export class RetrieveAllRepository implements IAggregateRepository {
  public collection = collectionName

  constructor(public database: IDatabase) {}

  async handle(query: IQuery, options?: unknown): Promise<IAggregateOutput> {
    const pipeline: IPipeline[] = []

    const filters = [] // filter keys using "and" logic
    const filterAll = [] // filter keys using "or" logic

    if (query.filter?.search) {
      filterAll.push({ name: { $regex: query.filter?.search, $options: 'i' } })
      filterAll.push({ prefix_api_key: { $regex: query.filter?.search, $options: 'i' } })
      filters.push({ $or: filterAll })
    }

    if (query.filter?.name) {
      filters.push({ name: { $regex: query.filter?.name, $options: 'i' } })
    }

    if (query.filter?.created_date) {
      filters.push({
        $and: [
          {
            created_date: {
              $gte: new Date(query.filter.created_date),
            },
          },
          {
            created_date: {
              $lt: addDays(new Date(query.filter.created_date), 1),
            },
          },
        ],
      })
    }

    if (query.filter?.prefix_api_key) {
      filters.push({ prefix_api_key: { $regex: query.filter.prefix_api_key, $options: 'i' } })
    }

    if (filters.length) {
      pipeline.push({ $match: { $and: filters } })
    }

    const response = await this.database.collection(this.collection).aggregate(pipeline, query, options)

    return {
      data: response.data,
      pagination: response.pagination,
    }
  }
}
