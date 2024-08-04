import type { IDatabase, IDeleteOutput, IDeleteRepository } from '@point-hub/papi'

import { collectionName } from '../entity'

export class DeleteRepository implements IDeleteRepository {
  constructor(public database: IDatabase) {}

  async handle(_id: string, options?: unknown): Promise<IDeleteOutput> {
    return await this.database.collection(collectionName).delete(_id, options)
  }
}
