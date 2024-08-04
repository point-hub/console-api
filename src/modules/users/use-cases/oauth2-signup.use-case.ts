import type { ICreateOutput, ICreateRepository, ISchemaValidation } from '@point-hub/papi'

import { renderHbsTemplate, sendMail } from '@/utils/email'

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
  cleanObject(object: object): object
  schemaValidation: ISchemaValidation
  hashPassword(password: string): Promise<string>
  sendEmail(html: string, to: string, subject: string): void
  renderHbsTemplate(template: string, context: Record<string, unknown>): Promise<string>
  generateVerificationLink(): string
  generateVerificationCode(): string
}
export interface IOptions {
  session?: unknown
}

export class SignupUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<ICreateOutput> {
    // 1. validate schema
    await deps.schemaValidation(input, signupValidation)
    // 2. define entity
    const linkVerification = deps.generateVerificationLink()
    const codeVerification = deps.generateVerificationCode()
    const userEntity = new UserEntity({
      name: input.name,
      username: input.username,
      email: input.email,
      password: input.password ? await deps.hashPassword(input.password) : '',
      email_verification_code: codeVerification,
    })
    userEntity.generateCreatedDate()
    const cleanEntity = deps.cleanObject(userEntity.data)
    // 3. database operation
    const response = await deps.signupRepository.handle(cleanEntity, options)
    // 4. send welcome email
    const compiledTemplate = await renderHbsTemplate('users/emails/email-verification.hbs', {
      name: userEntity.data.name,
      linkVerification: linkVerification,
      codeVerification: codeVerification,
    })
    sendMail(compiledTemplate, userEntity.data.email as string, 'Welcome to Pointhub')
    // 5. return response
    return {
      inserted_id: response.inserted_id,
    }
  }
}
