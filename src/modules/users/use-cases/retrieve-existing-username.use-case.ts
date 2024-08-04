import type { IRetrieveAllRepository, ISchemaValidation } from '@point-hub/papi'

import { UserEntity } from '../entity'
import { retrieveExistingUsernameValidation } from '../validations/retrieve-existing-username.validation'

export interface IInput {
  username: string
}
export interface IDeps {
  retrieveExistingUsernameRepository: IRetrieveAllRepository
  cleanObject(object: object): object
  schemaValidation: ISchemaValidation
}
export interface IOptions {
  session?: unknown
}

export class RetrieveExistingUsernameUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<boolean> {
    // 1. define entity
    const userEntity = new UserEntity({
      username: input.username,
    })
    const cleanEntity = deps.cleanObject(userEntity.data)
    // 2. validate schema
    await deps.schemaValidation(cleanEntity, retrieveExistingUsernameValidation)
    // 3. database operation
    const response = await deps.retrieveExistingUsernameRepository.handle(
      { filter: { trimmed_username: userEntity.data.trimmed_username } },
      options,
    )
    // 4. return is username exists or not
    return response.pagination.total_document > 0
  }
}
