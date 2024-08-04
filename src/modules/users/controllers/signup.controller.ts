import { objClean } from '@point-hub/express-utils'
import type { IController, IControllerInput } from '@point-hub/papi'

import { CreateRepository as CreateOrganizationRepository } from '@/modules/organizations/repositories/create.repository'
import { CreateRepository as CreateProjectRepository } from '@/modules/projects/repositories/create.repository'
import { renderHbsTemplate, sendMail } from '@/utils/email'
import { throwApiError } from '@/utils/throw-api-error'
import { schemaValidation } from '@/utils/validation'

import { SignupRepository } from '../repositories/signup.repository'
import { SignupUseCase } from '../use-cases/signup.use-case'

export const signupController: IController = async (controllerInput: IControllerInput) => {
  let session
  try {
    // 1. start session for transactional
    session = controllerInput.dbConnection.startSession()
    session.startTransaction()
    // 2. define repository
    const signupRepository = new SignupRepository(controllerInput.dbConnection)
    const createOrganizationRepository = new CreateOrganizationRepository(controllerInput.dbConnection)
    const createProjectRepository = new CreateProjectRepository(controllerInput.dbConnection)
    // 3. handle business rules
    const responseCreate = await SignupUseCase.handle(
      controllerInput.httpRequest.body,
      {
        signupRepository,
        createOrganizationRepository,
        createProjectRepository,
        cleanObject: objClean,
        schemaValidation,
        renderHbsTemplate: renderHbsTemplate,
        sendEmail: sendMail,
        throwApiError,
      },
      { session },
    )

    await session.commitTransaction()
    // 4. return response to client
    return {
      status: 201,
      json: {
        inserted_id: responseCreate.inserted_id,
      },
    }
  } catch (error) {
    await session?.abortTransaction()
    throw error
  } finally {
    await session?.endSession()
  }
}
