import type { IAggregateRepository, IRetrieveOutput, ISchemaValidation, TypeCodeStatus } from '@point-hub/papi'
import { type JwtPayload } from 'jsonwebtoken'

import { throwApiError } from '@/utils/throw-api-error'

import { verifyTokenValidation } from '../validations/verify-token.validation'

export interface IInput {
  project_id: string
  token: string
  secret: string
}
export interface IDeps {
  retrieveAuthUserRepository: IAggregateRepository
  throwApiError(codeStatus: TypeCodeStatus, message?: string, errors?: object): void
  schemaValidation: ISchemaValidation
  verifyToken(token: string, secret: string): string | JwtPayload
}
export interface IOptions {
  session?: unknown
}

export class VerifyTokenUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<IRetrieveOutput> {
    // 1. validate schema
    await deps.schemaValidation(input, verifyTokenValidation)
    // 2. verify token
    const decodedToken = deps.verifyToken(input.token, input.secret)
    if (!decodedToken) {
      // err 2.1 unverified token
      throwApiError(403)
    }
    // 3. database operation
    console.log('input', input)
    const authUser = await deps.retrieveAuthUserRepository.handle(
      { user_id: decodedToken.sub, project_id: input.project_id },
      options,
    )
    // 4. return response
    return {
      _id: authUser.data[0]._id,
      email: authUser.data[0].email,
      username: authUser.data[0].username,
      name: authUser.data[0].name,
      organization: authUser.data[0].organization,
      project: authUser.data[0].project,
    }
  }
}
