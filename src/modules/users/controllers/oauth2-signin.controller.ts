import { objClean } from '@point-hub/express-utils'
import { type IController, type IControllerInput } from '@point-hub/papi'

import { throwApiError } from '@/utils/throw-api-error'
import { schemaValidation } from '@/utils/validation'

import { RetrieveAllRepository } from '../repositories/retrieve-all.repository'
import { SigninUseCase } from '../use-cases/signin.use-case'
import { generateAccessToken, generateRefreshToken } from '../utils/jwt'

export const oAuth2SigninController: IController = async (controllerInput: IControllerInput) => {
  let session
  try {
    // 1. start session for transactional
    session = controllerInput.dbConnection.startSession()
    session.startTransaction()
    // 2. define repository
    const retrieveMatchedUsernameRepository = new RetrieveAllRepository(controllerInput.dbConnection)
    // 3. handle business rules
    const response = await SigninUseCase.handle(
      controllerInput.httpRequest.body,
      {
        retrieveMatchedUsernameRepository,
        cleanObject: objClean,
        schemaValidation,
        verifyPassword: Bun.password.verify,
        throwApiError,
        generateAccessToken,
        generateRefreshToken,
      },
      { session },
    )
    await session.commitTransaction()
    // 4. return response to client
    const date = new Date()
    date.setDate(date.getDate() + 60)
    return {
      status: 200,
      cookies: [
        {
          name: 'POINTHUB_ACCESS',
          val: response.tokens.access_token,
          options: {
            secure: true,
            httpOnly: true,
            signed: true,
            expires: date,
          },
        },
      ],
      json: {
        _id: response._id,
        email: response.email,
        username: response.username,
        name: response.name,
        tokens: {
          token_type: response.tokens.token_type,
          access_token: response.tokens.access_token,
          refresh_token: response.tokens.refresh_token,
        },
      },
    }
  } catch (error) {
    await session?.abortTransaction()
    throw error
  } finally {
    await session?.endSession()
  }
}
