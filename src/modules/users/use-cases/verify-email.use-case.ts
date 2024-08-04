import type {
  IRetrieveAllRepository,
  ISchemaValidation,
  IUpdateOutput,
  IUpdateRepository,
  TypeCodeStatus,
} from '@point-hub/papi'

import { throwApiError } from '@/utils/throw-api-error'

import { UserEntity } from '../entity'
import { verifyEmailValidation } from '../validations/verify-email.validation'

export interface IInput {
  code: string
}
export interface IDeps {
  verifyEmailRepository: IUpdateRepository
  retrieveAllRepository: IRetrieveAllRepository
  throwApiError(codeStatus: TypeCodeStatus, message?: string, errors?: object): void
  cleanObject(object: object): object
  schemaValidation: ISchemaValidation
}
export interface IOptions {
  session?: unknown
}

export class VerifyEmailUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<IUpdateOutput> {
    // 1. validate schema
    await deps.schemaValidation(input, verifyEmailValidation)
    // 2. define entity
    const userEntity = new UserEntity({
      is_email_verified: true,
    })
    userEntity.generateUpdatedDate()
    const cleanEntity = deps.cleanObject(userEntity.data)
    // 3. database operation
    const userResponse = await deps.retrieveAllRepository.handle({
      filter: {
        email_verification_code: input.code,
      },
    })
    // err.3.1
    if (userResponse.data.length === 0) {
      throwApiError(400, 'verification code is invalid')
    }
    // err.3.2
    if (userResponse.data[0].is_email_verified) {
      throwApiError(400, 'email is verified')
    }
    const response = await deps.verifyEmailRepository.handle(userResponse.data[0]._id, cleanEntity, options)
    // 4. return response
    return {
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    }
  }
}
