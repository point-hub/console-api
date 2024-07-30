import { Router } from 'express'

import { IBaseAppInput } from '@/app'
import { makeController } from '@/express'

import * as controller from './controllers/index'

const makeRouter = async (routerInput: IBaseAppInput) => {
  const router = Router()

  router.post(
    '/',
    await makeController({
      controller: controller.createApplicationController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.get(
    '/',
    await makeController({
      controller: controller.retrieveAllApplicationController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.get(
    '/:id',
    await makeController({
      controller: controller.retrieveApplicationController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.patch(
    '/:id',
    await makeController({
      controller: controller.updateApplicationController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.delete(
    '/:id',
    await makeController({
      controller: controller.deleteApplicationController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.post(
    '/create-many',
    await makeController({
      controller: controller.createManyApplicationController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.post(
    '/update-many',
    await makeController({
      controller: controller.updateManyApplicationController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.post(
    '/delete-many',
    await makeController({
      controller: controller.deleteManyApplicationController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.post(
    '/transaction',
    await makeController({
      controller: controller.transactionApplicationController,
      dbConnection: routerInput.dbConnection,
    }),
  )

  return router
}

export default makeRouter
