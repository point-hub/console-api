import type { IDatabase, IQuery, IRetrieveAllOutput, IRetrieveAllRepository } from '@point-hub/papi'

import { collectionName } from '../entity'

export class RetrieveAllRepository implements IRetrieveAllRepository {
  constructor(public database: IDatabase) {}

  async handle(query: IQuery, options?: unknown): Promise<IRetrieveAllOutput> {
    return await this.database.collection(collectionName).retrieveAll(query, options)
  }
}
