import type { IDocument, ISchemaValidation, IUpdateManyOutput, IUpdateManyRepository } from '@point-hub/papi'

import { UserEntity } from '../entity'
import { updateManyValidation } from '../validations/update-many.validation'

export interface IInput {
  filter: IDocument
  data: {
    name?: string
    phone?: string
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

export class UpdateManyUserUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<IUpdateManyOutput> {
    // 1. define entity
    const userEntity = new UserEntity({
      name: input.data.name,
      phone: input.data.phone,
    })
    userEntity.generateUpdatedDate()
    const cleanEntity = deps.cleanObject(userEntity.data)
    // 2. validate schema
    await deps.schemaValidation(cleanEntity, updateManyValidation)
    // 3. database operation
    const response = await deps.updateManyRepository.handle(input.filter, cleanEntity, options)
    return {
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    }
  }
}
