import type { IAggregateOutput, IAggregateRepository, IDatabase, IDocument, IPipeline, IQuery } from '@point-hub/papi'

import { collectionName } from '../entity'

export interface IFilter {
  user_id: string
  project_id?: string
}

export class RetrieveAuthUserRepository implements IAggregateRepository {
  public collection = collectionName

  constructor(public database: IDatabase) {}

  async handle(filter: IDocument, options?: unknown): Promise<IAggregateOutput> {
    const pipeline: IPipeline[] = []

    // match user
    pipeline.push({
      $match: {
        _id: filter.user_id,
      },
    })

    // join organization
    pipeline.push({
      $lookup: {
        from: 'organizations',
        localField: '_id',
        foreignField: 'owner_id',
        pipeline: [{ $project: { name: 1 } }],
        as: 'organization',
      },
    })
    pipeline.push({
      $set: {
        organization: {
          $arrayElemAt: ['$organization', 0],
        },
      },
    })
    pipeline.push({ $unset: ['organization_id'] })

    const lookupProjectPipeline: IPipeline[] = []
    console.log('filter', filter)
    if (filter.project_id) {
      lookupProjectPipeline.push({ $match: { _id: filter.project_id } })
      console.log(lookupProjectPipeline)
    }
    lookupProjectPipeline.push({ $project: { name: 1 } })

    // join project
    pipeline.push({
      $lookup: {
        from: 'projects',
        localField: 'organization._id',
        foreignField: 'organization_id',
        pipeline: lookupProjectPipeline,
        as: 'project',
      },
    })
    pipeline.push({
      $set: {
        project: {
          $arrayElemAt: ['$project', 0],
        },
      },
    })
    pipeline.push({ $unset: ['project_id'] })

    const query: IQuery = {
      page: filter.page,
      page_size: filter.page_size,
      sort: filter.sort,
    }
    const aggregateResult = await this.database.collection(this.collection).aggregate(pipeline, query, options)

    return {
      data: [
        {
          _id: aggregateResult.data[0]._id,
          name: aggregateResult.data[0].name,
          email: aggregateResult.data[0].email,
          username: aggregateResult.data[0].username,
          organization: {
            _id: aggregateResult.data[0].organization._id,
            name: aggregateResult.data[0].organization.name,
          },
          project: {
            _id: aggregateResult.data[0].project?._id,
            name: aggregateResult.data[0].project?.name,
          },
        },
      ],
      pagination: aggregateResult.pagination,
    }
  }
}
