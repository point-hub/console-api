import { DatabaseTestUtil } from '@point-hub/papi'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { isValid } from 'date-fns'
import type { Express } from 'express'
import request from 'supertest'

import { createApp } from '@/app'

import OrganizationFactory from '../factory'

describe('retrieve an organization', async () => {
  let app: Express
  beforeAll(async () => {
    app = await createApp({ dbConnection: DatabaseTestUtil.dbConnection })
  })
  beforeEach(async () => {
    await DatabaseTestUtil.reset()
  })
  it('retrieve success', async () => {
    const organizationFactory = new OrganizationFactory(DatabaseTestUtil.dbConnection)
    const resultFactory = await organizationFactory.createMany(3)

    const organizations = await DatabaseTestUtil.retrieveAll('organizations')

    const response = await request(app).get(`/v1/organizations/${resultFactory.inserted_ids[1]}`)

    // expect http response
    expect(response.statusCode).toEqual(200)

    // expect response json
    expect(response.body._id).toBeDefined()
    expect(response.body.name).toStrictEqual(organizations.data[1].name)
    expect(response.body.phone).toStrictEqual(organizations.data[1].phone)
    expect(isValid(new Date(response.body.created_date))).toBeTruthy()
  })
})
