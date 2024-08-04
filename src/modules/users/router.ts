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
    '/signin',
    await makeController({
      controller: controller.signinController,
      dbConnection: routerInput.dbConnection,
    }),
  )

  return router
}

export default makeRouter
