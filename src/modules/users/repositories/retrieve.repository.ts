import type { IDatabase, IRetrieveOutput, IRetrieveRepository } from '@point-hub/papi'

import { collectionName } from '../entity'

export class RetrieveRepository implements IRetrieveRepository {
  constructor(public database: IDatabase) {}

  async handle(_id: string, options?: unknown): Promise<IRetrieveOutput> {
    return await this.database.collection(collectionName).retrieve(_id, options)
  }
}
