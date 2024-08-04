import type { IDatabase, IDeleteManyOutput, IDeleteManyRepository } from '@point-hub/papi'

import { collectionName } from '../entity'

export class DeleteManyRepository implements IDeleteManyRepository {
  constructor(public database: IDatabase) {}

  async handle(ids: string[], options?: unknown): Promise<IDeleteManyOutput> {
    return await this.database.collection(collectionName).deleteMany(ids, options)
  }
}
