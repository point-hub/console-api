import type { ISchemaValidation, IUpdateOutput, IUpdateRepository } from '@point-hub/papi'

import { ApplicationEntity } from '../entity'
import { updateValidation } from '../validations/update.validation'

export interface IInput {
  _id: string
  data: {
    name?: string
    short_name?: string
  }
}
export interface IDeps {
  cleanObject(object: object): object
  schemaValidation: ISchemaValidation
  updateRepository: IUpdateRepository
}
export interface IOptions {
  session?: unknown
}

export class UpdateApplicationUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<IUpdateOutput> {
    // 1. validate schema
    await deps.schemaValidation(input, updateValidation)
    // 2. define entity
    const applicationEntity = new ApplicationEntity({
      name: input.data.name,
      short_name: input.data.short_name,
    })
    applicationEntity.generateUpdatedDate()
    const cleanEntity = deps.cleanObject(applicationEntity.data)
    // 3. database operation
    const response = await deps.updateRepository.handle(input._id, cleanEntity, options)
    return {
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    }
  }
}
