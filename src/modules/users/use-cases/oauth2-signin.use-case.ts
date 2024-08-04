import type { IRetrieveAllRepository, IRetrieveOutput, ISchemaValidation, TypeCodeStatus } from '@point-hub/papi'

import { UserEntity } from '../entity'
import { signinValidation } from '../validations/signin.validation'

export interface IInput {
  username: string
  password: string
}
export interface IDeps {
  retrieveMatchedUsernameRepository: IRetrieveAllRepository
  cleanObject(object: object): object
  schemaValidation: ISchemaValidation
  verifyPassword(password: string, hash: string): Promise<boolean>
  throwApiError(codeStatus: TypeCodeStatus, message?: string, errors?: object): void
  generateAccessToken(_id: string): string
  generateRefreshToken(_id: string): string
}
export interface IOptions {
  session?: unknown
}
interface IOutput extends IRetrieveOutput {
  email: string
  username: string
  name: string
  tokens: {
    token_type: string
    access_token: string
    refresh_token: string
  }
}

export class Oauth2SigninUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<IOutput> {
    // 1. validate schema
    await deps.schemaValidation({ username: input.username, password: input.password }, signinValidation)
    // 2. check any matched username / email in database
    const userInput = new UserEntity({ username: input.username })
    const users = await deps.retrieveMatchedUsernameRepository.handle(
      { filter: { username: userInput.data.trimmed_username } },
      options,
    )
    // err.1. return error username is invalid
    if (users.data.length === 0) {
      deps.throwApiError(422, undefined, {
        username: ['username is invalid'],
      })
    }
    // 3. validate password
    const user = new UserEntity(users.data[0])
    const isPasswordVerified = await deps.verifyPassword(input.password, user.data.password as string)
    // err.2. return error password is invalid
    if (!isPasswordVerified) {
      deps.throwApiError(422, undefined, {
        password: ['password is invalid'],
      })
    }
    // err.3. email is not verified
    if (!user.data.is_email_verified) {
      deps.throwApiError(422, undefined, {
        username: ['email is not verified'],
      })
    }
    // 4. generate access token
    const accessToken = deps.generateAccessToken(user.data._id as string)
    const refreshToken = deps.generateRefreshToken(user.data._id as string)
    // 5 setup auth cookies
    const date = new Date()
    date.setDate(date.getDate() + 60)
    const cookies = [
      {
        name: 'POINTHUB_ACCESS',
        val: accessToken,
        options: {
          secure: true,
          httpOnly: true,
          signed: true,
          expires: date,
        },
      },
    ]
    // 6. return data
    return {
      _id: user.data._id as string,
      email: user.data.email as string,
      username: user.data.username as string,
      name: user.data.name as string,
      cookies: cookies,
      tokens: {
        token_type: 'Bearer',
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    }
  }
}
