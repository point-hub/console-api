import { DatabaseTestUtil } from '@point-hub/papi'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { isValid } from 'date-fns'
import type { Express } from 'express'
import request from 'supertest'

import { createApp } from '@/app'

import OrganizationFactory from '../factory'

describe('update many organizations', async () => {
  let app: Express
  beforeAll(async () => {
    app = await createApp({ dbConnection: DatabaseTestUtil.dbConnection })
  })
  beforeEach(async () => {
    await DatabaseTestUtil.reset()
  })
  it('update success', async () => {
    const organizationFactory = new OrganizationFactory(DatabaseTestUtil.dbConnection)
    const organizationData = [
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
    organizationFactory.sequence(organizationData)
    const resultFactory = await organizationFactory.createMany(3)

    // suspend every organization data with name robot
    const response = await request(app)
      .post('/v1/organizations/update-many')
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
    const organizationRecord1 = await DatabaseTestUtil.retrieve('organizations', resultFactory.inserted_ids[0])
    expect(organizationRecord1.phone).toStrictEqual('11223344')
    expect(isValid(new Date(organizationRecord1.updated_date as string))).toBeTruthy()

    const organizationRecord2 = await DatabaseTestUtil.retrieve('organizations', resultFactory.inserted_ids[1])
    expect(organizationRecord2.phone).toStrictEqual('11223344')
    expect(isValid(new Date(organizationRecord2.updated_date as string))).toBeTruthy()

    // expect unmodified data
    const organizationRecord3 = await DatabaseTestUtil.retrieve('organizations', resultFactory.inserted_ids[2])
    expect(organizationRecord3.phone).toStrictEqual('12345678')
    expect(isValid(new Date(organizationRecord3.updated_date as string))).toBeFalsy()
  })
})
