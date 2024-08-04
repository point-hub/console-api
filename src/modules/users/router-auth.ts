import { Router } from 'express'

import { IBaseAppInput } from '@/app'
import { makeController } from '@/express'

import * as controller from './controllers/index'

const makeRouter = async (routerInput: IBaseAppInput) => {
  const router = Router()

  router.post(
    '/signup',
    await makeController({
      controller: controller.signupController,
      dbConnection: routerInput.dbConnection,
    }),
  )

  router.post(
    '/existing-email',
    await makeController({
      controller: controller.retrieveExistingEmailController,
      dbConnection: routerInput.dbConnection,
    }),
  )

  router.post(
    '/existing-username',
    await makeController({
      controller: controller.retrieveExistingUsernameController,
      dbConnection: routerInput.dbConnection,
    }),
  )

  return router
}

export default makeRouter
