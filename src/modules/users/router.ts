import { Router } from 'express'

import { IBaseAppInput } from '@/app'
import { makeController } from '@/express'

import * as controller from './controllers/index'

const makeRouter = async (routerInput: IBaseAppInput) => {
  const router = Router()

  router.post(
    '/',
    await makeController({
      controller: controller.createUserController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.get(
    '/',
    await makeController({
      controller: controller.retrieveAllUserController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.get(
    '/:id',
    await makeController({
      controller: controller.retrieveUserController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.patch(
    '/:id',
    await makeController({
      controller: controller.updateUserController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.delete(
    '/:id',
    await makeController({
      controller: controller.deleteUserController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.post(
    '/create-many',
    await makeController({
      controller: controller.createManyUserController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.post(
    '/update-many',
    await makeController({
      controller: controller.updateManyUserController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.post(
    '/delete-many',
    await makeController({
      controller: controller.deleteManyUserController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.post(
    '/transaction',
    await makeController({
      controller: controller.transactionUserController,
      dbConnection: routerInput.dbConnection,
    }),
  )

  return router
}

export default makeRouter
