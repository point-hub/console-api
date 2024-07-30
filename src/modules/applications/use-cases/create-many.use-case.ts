import type { ICreateManyOutput, ICreateManyRepository, ISchemaValidation } from '@point-hub/papi'

import { ApplicationEntity } from '../entity'
import { createManyValidation } from '../validations/create-many.validation'

export interface IInput {
  applications: {
    name?: string
    short_name?: string
  }[]
}
export interface IDeps {
  cleanObject(object: object): object
  schemaValidation: ISchemaValidation
  createManyRepository: ICreateManyRepository
}
export interface IOptions {
  session?: unknown
}

export class CreateManyApplicationUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<ICreateManyOutput> {
    const entities = []
    for (const document of input.applications) {
      const applicationEntity = new ApplicationEntity({
        name: document.name,
        short_name: document.short_name,
      })
      applicationEntity.generateCreatedDate()
      entities.push(deps.cleanObject(applicationEntity.data))
    }
    await deps.schemaValidation({ applications: entities }, createManyValidation)
    const response = await deps.createManyRepository.handle(entities, options)
    return {
      inserted_ids: response.inserted_ids,
      inserted_count: response.inserted_count,
    }
  }
}
