import { DatabaseTestUtil } from '@point-hub/papi'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import type { Express } from 'express'
import request from 'supertest'

import { createApp } from '@/app'

import UserFactory from '../factory'

describe('delete many users', async () => {
  let app: Express
  beforeAll(async () => {
    app = await createApp({ dbConnection: DatabaseTestUtil.dbConnection })
  })
  beforeEach(async () => {
    await DatabaseTestUtil.reset()
  })
  it('delete success', async () => {
    const userFactory = new UserFactory(DatabaseTestUtil.dbConnection)
    const resultFactory = await userFactory.createMany(3)

    const response = await request(app)
      .post('/v1/users/delete-many')
      .send({
        ids: [resultFactory.inserted_ids[0], resultFactory.inserted_ids[1]],
      })

    // expect http response
    expect(response.statusCode).toEqual(200)

    // expect response json
    expect(response.body).toStrictEqual({ deleted_count: 2 })

    // expect recorded data
    const userRecord1 = await DatabaseTestUtil.retrieve('users', resultFactory.inserted_ids[0])
    expect(userRecord1).toBeNull()
    const userRecord2 = await DatabaseTestUtil.retrieve('users', resultFactory.inserted_ids[1])
    expect(userRecord2).toBeNull()

    const userRecords = await DatabaseTestUtil.retrieveAll('users')
    expect(userRecords.data.length).toStrictEqual(1)
  })
})
