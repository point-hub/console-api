import { DatabaseTestUtil } from '@point-hub/papi'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import type { Express } from 'express'
import request from 'supertest'

import { createApp } from '@/app'

import OrganizationFactory from '../factory'

describe('delete an organization', async () => {
  let app: Express
  beforeAll(async () => {
    app = await createApp({ dbConnection: DatabaseTestUtil.dbConnection })
  })
  beforeEach(async () => {
    await DatabaseTestUtil.reset()
  })
  it('delete success', async () => {
    const organizationFactory = new OrganizationFactory(DatabaseTestUtil.dbConnection)
    const resultFactory = await organizationFactory.createMany(3)

    const response = await request(app).delete(`/v1/organizations/${resultFactory.inserted_ids[1]}`)

    // expect http response
    expect(response.statusCode).toEqual(200)

    // expect response json
    expect(response.body).toStrictEqual({ deleted_count: 1 })

    // expect recorded data
    const organizationRecord = await DatabaseTestUtil.retrieve('organizations', resultFactory.inserted_ids[1])
    expect(organizationRecord).toBeNull()

    const organizationRecords = await DatabaseTestUtil.retrieveAll('organizations')
    expect(organizationRecords.data.length).toStrictEqual(2)
  })
})
