import { objClean } from '@point-hub/express-utils'
import type { IController, IControllerInput } from '@point-hub/papi'

import { schemaValidation } from '@/utils/validation'

import { CreateRepository } from '../repositories/create.repository'
import { CreateManyRepository } from '../repositories/create-many.repository'
import { DeleteRepository } from '../repositories/delete.repository'
import { DeleteManyRepository } from '../repositories/delete-many.repository'
import { UpdateRepository } from '../repositories/update.repository'
import { UpdateManyRepository } from '../repositories/update-many.repository'
import { CreateOrganizationUseCase } from '../use-cases/create.use-case'
import { CreateManyOrganizationUseCase } from '../use-cases/create-many.use-case'
import { DeleteOrganizationUseCase } from '../use-cases/delete.use-case'
import { DeleteManyOrganizationUseCase } from '../use-cases/delete-many.use-case'
import { UpdateOrganizationUseCase } from '../use-cases/update.use-case'
import { UpdateManyOrganizationUseCase } from '../use-cases/update-many.use-case'

export const transactionOrganizationController: IController = async (controllerInput: IControllerInput) => {
  let session
  try {
    // 1. start session for transactional
    session = controllerInput.dbConnection.startSession()
    session.startTransaction()
    // 2. define repository
    const createRepository = new CreateRepository(controllerInput.dbConnection)
    const createManyRepository = new CreateManyRepository(controllerInput.dbConnection)
    const updateRepository = new UpdateRepository(controllerInput.dbConnection)
    const updateManyRepository = new UpdateManyRepository(controllerInput.dbConnection)
    const deleteRepository = new DeleteRepository(controllerInput.dbConnection)
    const deleteManyRepository = new DeleteManyRepository(controllerInput.dbConnection)
    // 3. handle business rules
    const responseCreate = await CreateOrganizationUseCase.handle(
      controllerInput.httpRequest.body.new,
      {
        cleanObject: objClean,
        createRepository,
        schemaValidation,
      },
      { session },
    )
    // 3.1. create
    await CreateOrganizationUseCase.handle(
      controllerInput.httpRequest.body.create,
      {
        cleanObject: objClean,
        createRepository,
        schemaValidation,
      },
      { session },
    )
    await session.commitTransaction()
    session.startTransaction()
    // 3.2. create many
    const responseCreateMany = await CreateManyOrganizationUseCase.handle(
      controllerInput.httpRequest.body.createMany,
      {
        cleanObject: objClean,
        createManyRepository,
        schemaValidation,
      },
      { session },
    )
    await session.commitTransaction()
    session.startTransaction()
    // 3.3. update
    await UpdateOrganizationUseCase.handle(
      {
        _id: responseCreate.inserted_id,
        data: {
          name: controllerInput.httpRequest.body.update.name,
        },
      },
      {
        cleanObject: objClean,
        updateRepository,
        schemaValidation,
      },
      { session },
    )
    await session.commitTransaction()
    session.startTransaction()
    // 3.4. update many
    await UpdateManyOrganizationUseCase.handle(
      {
        filter: {
          name: controllerInput.httpRequest.body.updateMany.filter.name,
        },
        data: {
          name: controllerInput.httpRequest.body.updateMany.data.name,
        },
      },
      {
        cleanObject: objClean,
        updateManyRepository,
        schemaValidation,
      },
      { session },
    )
    await session.commitTransaction()
    session.startTransaction()
    // 3.5. delete
    await DeleteOrganizationUseCase.handle(
      { _id: controllerInput.httpRequest.body.delete === true ? responseCreate.inserted_id : '' },
      {
        schemaValidation,
        deleteRepository,
      },
      { session },
    )
    await session.commitTransaction()
    session.startTransaction()
    // 3.6. delete many
    await DeleteManyOrganizationUseCase.handle(
      { ids: controllerInput.httpRequest.body.deleteMany === true ? responseCreateMany.inserted_ids : [''] },
      {
        schemaValidation,
        deleteManyRepository,
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
