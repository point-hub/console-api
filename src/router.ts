import express, { Express } from 'express'

import { IBaseAppInput } from './app'
import applicationRouter from './modules/applications/router'
import exampleRouter from './modules/example/router'
import organizationRouter from './modules/organizations/router'
import userRouter from './modules/users/router'

export default async function (baseRouterInput: IBaseAppInput) {
  const app: Express = express()

  /**
   * Register all available modules
   * <modules>/router.ts
   */
  app.use('/v1/examples', await exampleRouter(baseRouterInput))
  app.use('/v1/users', await userRouter(baseRouterInput))
  app.use('/v1/organizations', await organizationRouter(baseRouterInput))
  app.use('/v1/applications', await applicationRouter(baseRouterInput))

  return app
}
