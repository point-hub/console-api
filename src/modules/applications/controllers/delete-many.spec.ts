import { DatabaseTestUtil } from '@point-hub/papi'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import type { Express } from 'express'
import request from 'supertest'

import { createApp } from '@/app'

import ApplicationFactory from '../factory'

describe('delete many applications', async () => {
  let app: Express
  beforeAll(async () => {
    app = await createApp({ dbConnection: DatabaseTestUtil.dbConnection })
  })
  beforeEach(async () => {
    await DatabaseTestUtil.reset()
  })
  it('delete success', async () => {
    const applicationFactory = new ApplicationFactory(DatabaseTestUtil.dbConnection)
    const resultFactory = await applicationFactory.createMany(3)

    const response = await request(app)
      .post('/v1/applications/delete-many')
      .send({
        ids: [resultFactory.inserted_ids[0], resultFactory.inserted_ids[1]],
      })

    // expect http response
    expect(response.statusCode).toEqual(200)

    // expect response json
    expect(response.body).toStrictEqual({ deleted_count: 2 })

    // expect recorded data
    const applicationRecord1 = await DatabaseTestUtil.retrieve('applications', resultFactory.inserted_ids[0])
    expect(applicationRecord1).toBeNull()
    const applicationRecord2 = await DatabaseTestUtil.retrieve('applications', resultFactory.inserted_ids[1])
    expect(applicationRecord2).toBeNull()

    const applicationRecords = await DatabaseTestUtil.retrieveAll('applications')
    expect(applicationRecords.data.length).toStrictEqual(1)
  })
})
