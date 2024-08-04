import type { ICreateManyOutput, ICreateManyRepository, IDatabase, IDocument } from '@point-hub/papi'

import { collectionName } from '../entity'

export class CreateManyRepository implements ICreateManyRepository {
  constructor(public database: IDatabase) {}

  async handle(documents: IDocument[], options?: unknown): Promise<ICreateManyOutput> {
    return await this.database.collection(collectionName).createMany(documents, options)
  }
}
