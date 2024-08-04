import type { IRetrieveAllRepository, ISchemaValidation } from '@point-hub/papi'

import { UserEntity } from '../entity'
import { retrieveExistingEmailValidation } from '../validations/retrieve-existing-email.validation'

export interface IInput {
  email: string
}
export interface IDeps {
  retrieveExistingEmailRepository: IRetrieveAllRepository
  cleanObject(object: object): object
  schemaValidation: ISchemaValidation
}
export interface IOptions {
  session?: unknown
}

export class RetrieveExistingEmailUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<boolean> {
    // 1. define entity
    const userEntity = new UserEntity({
      email: input.email,
    })
    const cleanEntity = deps.cleanObject(userEntity.data)
    // 2. validate schema
    await deps.schemaValidation(cleanEntity, retrieveExistingEmailValidation)
    // 3. database operation
    const response = await deps.retrieveExistingEmailRepository.handle(
      { filter: { trimmed_email: userEntity.data.trimmed_email } },
      options,
    )
    // 4. return is email exists or not
    return response.pagination.total_document > 0
  }
}
