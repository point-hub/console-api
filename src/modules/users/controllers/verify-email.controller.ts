import { objClean } from '@point-hub/express-utils'
import { type IController, type IControllerInput } from '@point-hub/papi'

import { throwApiError } from '@/utils/throw-api-error'
import { schemaValidation } from '@/utils/validation'

import { RetrieveAllRepository } from '../repositories/retrieve-all.repository'
import { VerifyEmailRepository } from '../repositories/verify-email.repository'
import { VerifyEmailUseCase } from '../use-cases/verify-email.use-case'

export const verifyEmailController: IController = async (controllerInput: IControllerInput) => {
  let session
  try {
    console.log(new Date())
    // 1. start session for transactional
    session = controllerInput.dbConnection.startSession()
    session.startTransaction()
    // 2. define repository
    const verifyEmailRepository = new VerifyEmailRepository(controllerInput.dbConnection)
    const retrieveAllRepository = new RetrieveAllRepository(controllerInput.dbConnection)
    // 3. handle business rules
    const response = await VerifyEmailUseCase.handle(
      controllerInput.httpRequest.body,
      {
        verifyEmailRepository,
        retrieveAllRepository,
        cleanObject: objClean,
        schemaValidation,
        throwApiError,
      },
      { session },
    )
    await session.commitTransaction()
    // 4. return response to client
    return {
      status: 200,
      json: {
        matched_count: response.matched_count,
        modified_count: response.modified_count,
      },
    }
  } catch (error) {
    await session?.abortTransaction()
    throw error
  } finally {
    await session?.endSession()
  }
}
