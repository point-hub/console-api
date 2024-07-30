import type { ISchemaValidation, IUpdateOutput, IUpdateRepository } from '@point-hub/papi'

import { UserEntity } from '../entity'
import { updateValidation } from '../validations/update.validation'

export interface IInput {
  _id: string
  data: {
    name?: string
    phone?: string
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

export class UpdateUserUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<IUpdateOutput> {
    // 1. define entity
    const userEntity = new UserEntity({
      name: input.data.name,
      phone: input.data.phone,
    })
    userEntity.generateUpdatedDate()
    const cleanEntity = deps.cleanObject(userEntity.data)
    // 2. validate schema
    await deps.schemaValidation(cleanEntity, updateValidation)
    // 3. database operation
    const response = await deps.updateRepository.handle(input._id, cleanEntity, options)
    return {
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    }
  }
}
