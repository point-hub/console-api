import type { ICreateOutput, ICreateRepository, IDatabase, IDocument } from '@point-hub/papi'

import { collectionName } from '../entity'

export class CreateRepository implements ICreateRepository {
  constructor(public database: IDatabase) {}

  async handle(document: IDocument, options?: unknown): Promise<ICreateOutput> {
    return await this.database.collection(collectionName).create(document, options)
  }
}
