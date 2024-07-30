import { faker } from '@faker-js/faker'
import { DatabaseTestUtil } from '@point-hub/papi'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { isValid } from 'date-fns'
import type { Express } from 'express'
import request from 'supertest'

import { createApp } from '@/app'

import ApplicationFactory from '../factory'

describe('update an application', async () => {
  let app: Express
  beforeAll(async () => {
    app = await createApp({ dbConnection: DatabaseTestUtil.dbConnection })
  })
  beforeEach(async () => {
    await DatabaseTestUtil.reset()
  })
  it('validate schema', async () => {
    const resultFactory = await new ApplicationFactory(DatabaseTestUtil.dbConnection).create()

    const applications = await DatabaseTestUtil.retrieveAll('applications')

    const updateData = {
      name: true,
    }

    const response = await request(app).patch(`/v1/applications/${resultFactory.inserted_id}`).send(updateData)

    // expect http response
    expect(response.statusCode).toEqual(422)

    // expect response json
    expect(response.body.code).toStrictEqual(422)
    expect(response.body.status).toStrictEqual('Unprocessable Entity')
    expect(response.body.message).toStrictEqual(
      'The request was well-formed but was unable to be followed due to semantic errors.',
    )
    expect(response.body.errors).toStrictEqual({
      name: ['The name must be a string.'],
    })

    // expect data unmodified
    const unmodifiedApplicationRecord = await DatabaseTestUtil.retrieve('applications', resultFactory.inserted_id)
    expect(unmodifiedApplicationRecord.name).toStrictEqual(applications.data[0].name)
    expect(unmodifiedApplicationRecord.updated_date).toBeUndefined()
  })
  it('update success', async () => {
    const resultFactory = await new ApplicationFactory(DatabaseTestUtil.dbConnection).createMany(3)

    const applications = await DatabaseTestUtil.retrieveAll('applications')

    const updateData = {
      name: faker.person.fullName(),
    }

    const response = await request(app).patch(`/v1/applications/${resultFactory.inserted_ids[1]}`).send(updateData)

    // expect http response
    expect(response.statusCode).toEqual(200)

    // expect response json
    expect(response.body).toStrictEqual({
      matched_count: 1,
      modified_count: 1,
    })

    // expect recorded data
    const applicationRecord = await DatabaseTestUtil.retrieve('applications', resultFactory.inserted_ids[1])
    expect(applicationRecord.name).toStrictEqual(updateData.name)
    expect(isValid(new Date(applicationRecord.updated_date as string))).toBeTruthy()

    // expect another data unmodified
    const unmodifiedApplicationRecord = await DatabaseTestUtil.retrieve('applications', resultFactory.inserted_ids[0])
    expect(unmodifiedApplicationRecord.name).toStrictEqual(applications.data[0].name)
    expect(unmodifiedApplicationRecord.updated_date).toBeUndefined()
  })
})
