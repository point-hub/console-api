import { faker } from '@faker-js/faker'
import { DatabaseTestUtil } from '@point-hub/papi'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { isValid } from 'date-fns'
import type { Express } from 'express'
import request from 'supertest'

import { createApp } from '@/app'

describe('create many users', async () => {
  let app: Express
  beforeAll(async () => {
    app = await createApp({ dbConnection: DatabaseTestUtil.dbConnection })
  })
  beforeEach(async () => {
    await DatabaseTestUtil.reset()
  })
  it('validate schema', async () => {
    const data = [
      {
        phone: faker.phone.number(),
      },
      {
        name: faker.person.fullName(),
        phone: faker.phone.number(),
      },
      {
        phone: faker.phone.number(),
      },
    ]

    const response = await request(app).post('/v1/users/create-many').send({ users: data })

    // expect http response
    expect(response.statusCode).toEqual(422)

    // expect response json
    expect(response.body.code).toStrictEqual(422)
    expect(response.body.status).toStrictEqual('Unprocessable Entity')
    expect(response.body.message).toStrictEqual(
      'The request was well-formed but was unable to be followed due to semantic errors.',
    )
    expect(response.body.errors).toStrictEqual({
      'users.0.name': ['The users.0.name field is required.'],
      'users.2.name': ['The users.2.name field is required.'],
    })

    // expect recorded data
    const userRecords = await DatabaseTestUtil.retrieveAll('users')
    expect(userRecords.data.length).toStrictEqual(0)
  })
  it('create success', async () => {
    const data = [
      {
        name: faker.person.fullName(),
        phone: faker.phone.number(),
      },
      {
        name: faker.person.fullName(),
        phone: faker.phone.number(),
      },
      {
        name: faker.person.fullName(),
        phone: faker.phone.number(),
      },
    ]

    const response = await request(app).post('/v1/users/create-many').send({ users: data })

    // expect http response
    expect(response.statusCode).toEqual(201)

    // expect response json
    expect(response.body.inserted_count).toBe(3)
    expect(response.body.inserted_ids.length).toBe(3)

    // expect recorded data
    const userRecords = await DatabaseTestUtil.retrieveAll('users', {
      filter: {
        _id: {
          $in: response.body.inserted_ids,
        },
      },
    })

    for (const [index, userRecord] of userRecords.data.entries()) {
      expect(userRecord._id).toStrictEqual(response.body.inserted_ids[index])
      expect(userRecord.name).toStrictEqual(data[index].name)
      expect(userRecord.phone).toStrictEqual(data[index].phone)
      expect(isValid(new Date(userRecord.created_date as string))).toBeTruthy()
    }
  })
})
