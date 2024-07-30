import type { ICreateManyOutput, ICreateManyRepository, ISchemaValidation } from '@point-hub/papi'

import { UserEntity } from '../entity'
import { createManyValidation } from '../validations/create-many.validation'

export interface IInput {
  users: {
    name?: string
    phone?: string
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

export class CreateManyUserUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<ICreateManyOutput> {
    const entities = []
    for (const document of input.users) {
      const userEntity = new UserEntity({
        name: document.name,
        phone: document.phone,
      })
      userEntity.generateCreatedDate()
      entities.push(deps.cleanObject(userEntity.data))
    }
    await deps.schemaValidation({ users: entities }, createManyValidation)
    const response = await deps.createManyRepository.handle(entities, options)
    return {
      inserted_ids: response.inserted_ids,
      inserted_count: response.inserted_count,
    }
  }
}
