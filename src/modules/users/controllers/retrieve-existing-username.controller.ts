import { objClean } from '@point-hub/express-utils'
import { type IController, type IControllerInput } from '@point-hub/papi'

import { schemaValidation } from '@/utils/validation'

import { RetrieveExistingUsernameRepository } from '../repositories/retrieve-existing-username.repository'
import { RetrieveExistingUsernameUseCase } from '../use-cases/retrieve-existing-username.use-case'

export const retrieveExistingUsernameController: IController = async (controllerInput: IControllerInput) => {
  let session
  try {
    // 1. start session for transactional
    session = controllerInput.dbConnection.startSession()
    session.startTransaction()
    // 2. define repository
    const retrieveExistingUsernameRepository = new RetrieveExistingUsernameRepository(controllerInput.dbConnection)
    // 3. handle business rules
    const response = await RetrieveExistingUsernameUseCase.handle(
      controllerInput.httpRequest.body,
      {
        retrieveExistingUsernameRepository,
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
