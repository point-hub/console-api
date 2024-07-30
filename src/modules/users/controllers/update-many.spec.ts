import { DatabaseTestUtil } from '@point-hub/papi'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { isValid } from 'date-fns'
import type { Express } from 'express'
import request from 'supertest'

import { createApp } from '@/app'

import UserFactory from '../factory'

describe('update many users', async () => {
  let app: Express
  beforeAll(async () => {
    app = await createApp({ dbConnection: DatabaseTestUtil.dbConnection })
  })
  beforeEach(async () => {
    await DatabaseTestUtil.reset()
  })
  it('update success', async () => {
    const userFactory = new UserFactory(DatabaseTestUtil.dbConnection)
    const userData = [
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
    userFactory.sequence(userData)
    const resultFactory = await userFactory.createMany(3)

    // suspend every user data with name robot
    const response = await request(app)
      .post('/v1/users/update-many')
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
    const userRecord1 = await DatabaseTestUtil.retrieve('users', resultFactory.inserted_ids[0])
    expect(userRecord1.phone).toStrictEqual('11223344')
    expect(isValid(new Date(userRecord1.updated_date as string))).toBeTruthy()

    const userRecord2 = await DatabaseTestUtil.retrieve('users', resultFactory.inserted_ids[1])
    expect(userRecord2.phone).toStrictEqual('11223344')
    expect(isValid(new Date(userRecord2.updated_date as string))).toBeTruthy()

    // expect unmodified data
    const userRecord3 = await DatabaseTestUtil.retrieve('users', resultFactory.inserted_ids[2])
    expect(userRecord3.phone).toStrictEqual('12345678')
    expect(isValid(new Date(userRecord3.updated_date as string))).toBeFalsy()
  })
})
