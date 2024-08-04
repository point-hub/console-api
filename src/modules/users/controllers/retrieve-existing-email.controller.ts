import { objClean } from '@point-hub/express-utils'
import { type IController, type IControllerInput } from '@point-hub/papi'

import { schemaValidation } from '@/utils/validation'

import { RetrieveExistingEmailRepository } from '../repositories/retrieve-existing-email.repository'
import { RetrieveExistingEmailUseCase } from '../use-cases/retrieve-existing-email.use-case'

export const retrieveExistingEmailController: IController = async (controllerInput: IControllerInput) => {
  let session
  try {
    // 1. start session for transactional
    session = controllerInput.dbConnection.startSession()
    session.startTransaction()
    // 2. define repository
    const retrieveExistingEmailRepository = new RetrieveExistingEmailRepository(controllerInput.dbConnection)
    // 3. handle business rules
    const response = await RetrieveExistingEmailUseCase.handle(
      controllerInput.httpRequest.body,
      {
        retrieveExistingEmailRepository,
        cleanObject: objClean,
        schemaValidation,
      },
      { session },
    )
    await session.commitTransaction()
    // 4. return response to client
    return {
      status: 200,
      json: {
        exists: response,
      },
    }
  } catch (error) {
    await session?.abortTransaction()
    throw error
  } finally {
    await session?.endSession()
  }
}
