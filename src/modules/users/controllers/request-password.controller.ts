import { objClean } from '@point-hub/express-utils'
import { type IController, type IControllerInput } from '@point-hub/papi'

import { throwApiError } from '@/utils/throw-api-error'
import { schemaValidation } from '@/utils/validation'

import { RetrieveAllRepository } from '../repositories/retrieve-all.repository'
import { SigninUseCase } from '../use-cases/signin.use-case'
import { generateAccessToken, generateRefreshToken } from '../utils/jwt'

export const requestPasswordController: IController = async (controllerInput: IControllerInput) => {
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
    return {
      status: 204,
      json: {},
    }
  } catch (error) {
    await session?.abortTransaction()
    throw error
  } finally {
    await session?.endSession()
  }
}
