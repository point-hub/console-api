import type { ICreateOutput, ICreateRepository, ISchemaValidation } from '@point-hub/papi'

import { ApplicationEntity } from '../entity'
import { createValidation } from '../validations/create.validation'

export interface IInput {
  name?: string
  short_name?: string
}
export interface IDeps {
  cleanObject(object: object): object
  createRepository: ICreateRepository
  schemaValidation: ISchemaValidation
}
export interface IOptions {
  session?: unknown
}

export class CreateApplicationUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<ICreateOutput> {
    // 1. validate schema
    await deps.schemaValidation(input, createValidation)
    // 2. define entity
    const applicationEntity = new ApplicationEntity({
      name: input.name,
      short_name: input.short_name,
    })
    applicationEntity.generateCreatedDate()
    const cleanEntity = deps.cleanObject(applicationEntity.data)
    // 3. database operation
    const response = await deps.createRepository.handle(cleanEntity, options)
    return { inserted_id: response.inserted_id }
  }
}
