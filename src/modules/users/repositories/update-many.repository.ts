import type { IDatabase, IDocument, IUpdateManyOutput, IUpdateManyRepository } from '@point-hub/papi'

import { collectionName } from '../entity'

export class UpdateManyRepository implements IUpdateManyRepository {
  constructor(public database: IDatabase) {}

  async handle(filter: IDocument, document: IDocument, options?: unknown): Promise<IUpdateManyOutput> {
    return await this.database.collection(collectionName).updateMany(filter, document, options)
  }
}
