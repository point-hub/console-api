import { faker } from '@faker-js/faker'
import { DatabaseTestUtil } from '@point-hub/papi'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { isValid } from 'date-fns'
import type { Express } from 'express'
import request from 'supertest'

import { createApp } from '@/app'

import OrganizationFactory from '../factory'

describe('create an organization', async () => {
  let app: Express
  beforeAll(async () => {
    app = await createApp({ dbConnection: DatabaseTestUtil.dbConnection })
  })
  beforeEach(async () => {
    await DatabaseTestUtil.reset()
  })
  it('validate unique column', async () => {
    const organizationFactory = new OrganizationFactory(DatabaseTestUtil.dbConnection)
    organizationFactory.state({
      name: 'John Doe',
    })
    await organizationFactory.create()
    const data = {
      name: 'John Doe',
    }

    const response = await request(app).post('/v1/organizations').send(data)

    // expect http response
    expect(response.statusCode).toEqual(422)
    // expect response json
    expect(response.body.code).toStrictEqual(422)
    expect(response.body.status).toStrictEqual('Unprocessable Entity')
    expect(response.body.message).toStrictEqual(
      'The request was well-formed but was unable to be followed due to semantic errors.',
    )
    expect(response.body.errors).toStrictEqual({
      name: ['The name is exists.'],
    })

    // expect recorded data
    const organizationRecord = await DatabaseTestUtil.retrieve('organizations', response.body.inserted_id)
    expect(organizationRecord).toBeNull()
  })
  it('validate schema', async () => {
    const data = {
      phone: faker.phone.number(),
    }

    const response = await request(app).post('/v1/organizations').send(data)

    // expect http response
    expect(response.statusCode).toEqual(422)

    // expect response json
    expect(response.body.code).toStrictEqual(422)
    expect(response.body.status).toStrictEqual('Unprocessable Entity')
    expect(response.body.message).toStrictEqual(
      'The request was well-formed but was unable to be followed due to semantic errors.',
    )
    expect(response.body.errors).toStrictEqual({
      name: ['The name field is required.'],
    })

    // expect recorded data
    const organizationRecord = await DatabaseTestUtil.retrieve('organizations', response.body.inserted_id)
    expect(organizationRecord).toBeNull()
  })
  it('create success', async () => {
    const data = {
      name: faker.person.fullName(),
      phone: faker.phone.number(),
    }

    const response = await request(app).post('/v1/organizations').send(data)

    // expect http response
    expect(response.statusCode).toEqual(201)

    // expect response json
    expect(response.body.inserted_id).toBeDefined()

    // expect recorded data
    const organizationRecord = await DatabaseTestUtil.retrieve('organizations', response.body.inserted_id)

    expect(organizationRecord._id).toStrictEqual(response.body.inserted_id)
    expect(organizationRecord.name).toStrictEqual(data.name)
    expect(isValid(new Date(organizationRecord.created_date as string))).toBeTruthy()
  })
})
