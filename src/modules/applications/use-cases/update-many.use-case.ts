import type { IDocument, ISchemaValidation, IUpdateManyOutput, IUpdateManyRepository } from '@point-hub/papi'

import { ApplicationEntity } from '../entity'
import { updateManyValidation } from '../validations/update-many.validation'

export interface IInput {
  filter: IDocument
  data: {
    name?: string
    short_name?: string
  }
}
export interface IDeps {
  cleanObject(object: object): object
  schemaValidation: ISchemaValidation
  updateManyRepository: IUpdateManyRepository
}
export interface IOptions {
  session?: unknown
}

export class UpdateManyApplicationUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<IUpdateManyOutput> {
    // 1. validate schema
    await deps.schemaValidation(input, updateManyValidation)
    // 2. define entity
    const applicationEntity = new ApplicationEntity({
      name: input.data.name,
      short_name: input.data.short_name,
    })
    applicationEntity.generateUpdatedDate()
    const cleanEntity = deps.cleanObject(applicationEntity.data)
    // 3. database operation
    const response = await deps.updateManyRepository.handle(input.filter, cleanEntity, options)
    return {
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    }
  }
}
