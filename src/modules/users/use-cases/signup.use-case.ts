import type { ICreateOutput, ICreateRepository, ISchemaValidation, TypeCodeStatus } from '@point-hub/papi'

import authServiceConfig from '@/config/auth-service'
import pointhubConfig from '@/config/pointhub'
import type { IOptions as IOptionsApiError } from '@/utils/throw-api-error'

import { UserEntity } from '../entity'
import { signupValidation } from '../validations/signup.validation'

export interface IInput {
  name: string
  username: string
  email: string
  password: string
}
export interface IDeps {
  signupRepository: ICreateRepository
  createOrganizationRepository: ICreateRepository
  createProjectRepository: ICreateRepository
  cleanObject(object: object): object
  schemaValidation: ISchemaValidation
  sendEmail(html: string, to: string, subject: string): void
  renderHbsTemplate(template: string, context: Record<string, unknown>): Promise<string>
  throwApiError(codeStatus: TypeCodeStatus, options?: IOptionsApiError): void
}
export interface IOptions {
  session?: unknown
}

export class SignupUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<ICreateOutput> {
    // 1. validate schema
    await deps.schemaValidation(input, signupValidation)
    // 2. define entity
    const userSignupEntity = new UserEntity({
      name: input.name,
      username: input.username,
      email: input.email,
      password: input.password,
    })
    userSignupEntity.generateCreatedDate()
    const cleanSignupEntity = deps.cleanObject(userSignupEntity.data)
    // 3. signup to auth service
    const response = await fetch(`${authServiceConfig.domain}/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Pointhub-Secret': pointhubConfig.secret },
      body: JSON.stringify(cleanSignupEntity),
    })
    console.log(await response.json())
    if (response.status === 403) {
      deps.throwApiError('Forbidden')
    }
    if (response.status >= 400) {
      deps.throwApiError('Internal Server Error')
    }
    // 3. database operation
    // 3.1. database operation - users
    const userEntity = new UserEntity({
      name: input.name,
      username: input.username,
      email: input.email,
      oauth: {
        pointhub: {
          name: '',
          username: '',
          email: '',
          tokens: [
            {
              _id: '',
              token_type: 'Bearer',
              access_token: '',
              refresh_token: '',
              scope: '',
              expiry_date: 1722596487112,
            },
          ],
        },
      },
    })
    userEntity.generateCreatedDate()
    const cleanUserEntity = deps.cleanObject(userEntity.data)
    const responseSignup = await deps.signupRepository.handle(cleanUserEntity, options)
    // 3.2. database operation - organizations
    const responseOrganization = await deps.createOrganizationRepository.handle({
      name: 'My Organization',
      owner_id: responseSignup.inserted_id,
      users: [responseSignup.inserted_id],
    })
    // 3.3. database operation - projects
    await deps.createProjectRepository.handle({
      name: 'My Team',
      organization_id: responseOrganization.inserted_id,
      users: [responseSignup.inserted_id],
    })
    // 4. return response
    return {
      inserted_id: responseSignup.inserted_id,
    }
  }
}
