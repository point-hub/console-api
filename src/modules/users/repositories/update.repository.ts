import type { IDatabase, IDocument, IUpdateOutput, IUpdateRepository } from '@point-hub/papi'

import { collectionName } from '../entity'

export class UpdateRepository implements IUpdateRepository {
  constructor(public database: IDatabase) {}

  async handle(_id: string, document: IDocument, options?: unknown): Promise<IUpdateOutput> {
    return await this.database.collection(collectionName).update(_id, document, options)
  }
}
