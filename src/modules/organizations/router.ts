import { Router } from 'express'

import { IBaseAppInput } from '@/app'
import { makeController } from '@/express'

import * as controller from './controllers/index'

const makeRouter = async (routerInput: IBaseAppInput) => {
  const router = Router()

  router.post(
    '/',
    await makeController({
      controller: controller.createOrganizationController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.get(
    '/',
    await makeController({
      controller: controller.retrieveAllOrganizationController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.get(
    '/:id',
    await makeController({
      controller: controller.retrieveOrganizationController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.patch(
    '/:id',
    await makeController({
      controller: controller.updateOrganizationController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.delete(
    '/:id',
    await makeController({
      controller: controller.deleteOrganizationController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.post(
    '/create-many',
    await makeController({
      controller: controller.createManyOrganizationController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.post(
    '/update-many',
    await makeController({
      controller: controller.updateManyOrganizationController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.post(
    '/delete-many',
    await makeController({
      controller: controller.deleteManyOrganizationController,
      dbConnection: routerInput.dbConnection,
    }),
  )
  router.post(
    '/transaction',
    await makeController({
      controller: controller.transactionOrganizationController,
      dbConnection: routerInput.dbConnection,
    }),
  )

  return router
}

export default makeRouter
