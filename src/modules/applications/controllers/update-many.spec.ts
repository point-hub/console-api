import { DatabaseTestUtil } from '@point-hub/papi'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { isValid } from 'date-fns'
import type { Express } from 'express'
import request from 'supertest'

import { createApp } from '@/app'

import ApplicationFactory from '../factory'

describe('update many applications', async () => {
  let app: Express
  beforeAll(async () => {
    app = await createApp({ dbConnection: DatabaseTestUtil.dbConnection })
  })
  beforeEach(async () => {
    await DatabaseTestUtil.reset()
  })
  it('update success', async () => {
    const applicationFactory = new ApplicationFactory(DatabaseTestUtil.dbConnection)
    const applicationData = [
      {
        phone: '',
      },
      {
        phone: '',
      },
      {
        phone: '12345678',
      },
    ]
    applicationFactory.sequence(applicationData)
    const resultFactory = await applicationFactory.createMany(3)

    // suspend every application data with name robot
    const response = await request(app)
      .post('/v1/applications/update-many')
      .send({
        filter: {
          phone: '',
        },
        data: {
          phone: '11223344',
        },
      })

    // expect http response
    expect(response.statusCode).toEqual(200)

    // expect response json
    expect(response.body).toStrictEqual({
      matched_count: 2,
      modified_count: 2,
    })

    // expect recorded data
    const applicationRecord1 = await DatabaseTestUtil.retrieve('applications', resultFactory.inserted_ids[0])
    expect(applicationRecord1.phone).toStrictEqual('11223344')
    expect(isValid(new Date(applicationRecord1.updated_date as string))).toBeTruthy()

    const applicationRecord2 = await DatabaseTestUtil.retrieve('applications', resultFactory.inserted_ids[1])
    expect(applicationRecord2.phone).toStrictEqual('11223344')
    expect(isValid(new Date(applicationRecord2.updated_date as string))).toBeTruthy()

    // expect unmodified data
    const applicationRecord3 = await DatabaseTestUtil.retrieve('applications', resultFactory.inserted_ids[2])
    expect(applicationRecord3.phone).toStrictEqual('12345678')
    expect(isValid(new Date(applicationRecord3.updated_date as string))).toBeFalsy()
  })
})
