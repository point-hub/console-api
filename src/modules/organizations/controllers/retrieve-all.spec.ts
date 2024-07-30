import { DatabaseTestUtil } from '@point-hub/papi'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { isValid } from 'date-fns'
import type { Express } from 'express'
import request from 'supertest'

import { createApp } from '@/app'

import OrganizationFactory from '../factory'

describe('retrieve all organizations', async () => {
  let app: Express
  beforeAll(async () => {
    app = await createApp({ dbConnection: DatabaseTestUtil.dbConnection })
  })
  beforeEach(async () => {
    await DatabaseTestUtil.reset()
  })
  it('retrieve success', async () => {
    const organizationFactory = new OrganizationFactory(DatabaseTestUtil.dbConnection)
    await organizationFactory.createMany(3)

    const organizations = await DatabaseTestUtil.retrieveAll('organizations')

    const response = await request(app).get(`/v1/organizations`)

    // expect http response
    expect(response.statusCode).toEqual(200)

    // expect response json
    expect(response.body.data.length).toStrictEqual(3)
    expect(response.body.data[0]._id).toBeDefined()
    expect(response.body.data[0].name).toStrictEqual(organizations.data[0].name)
    expect(isValid(new Date(response.body.data[0].created_date))).toBeTruthy()
    expect(response.body.data[1].name).toStrictEqual(organizations.data[1].name)
    expect(response.body.data[2].name).toStrictEqual(organizations.data[2].name)

    expect(response.body.pagination.page).toStrictEqual(1)
    expect(response.body.pagination.page_size).toStrictEqual(10)
    expect(response.body.pagination.page_count).toStrictEqual(1)
    expect(response.body.pagination.total_document).toStrictEqual(3)
  })
  it('sort data in ascending order', async () => {
    const organizationFactory = new OrganizationFactory(DatabaseTestUtil.dbConnection)
    const data = [
      {
        name: 'John Doe',
      },
      {
        name: 'Charles',
      },
      {
        name: 'Jane',
      },
    ]
    organizationFactory.sequence(data)
    await organizationFactory.createMany(3)

    const response = await request(app).get(`/v1/organizations`).query({
      sort: 'name',
    })

    // expect http response
    expect(response.statusCode).toEqual(200)

    // expect response json
    expect(response.body.data.length).toStrictEqual(3)
    expect(response.body.data[0].name).toStrictEqual(data[1].name) // Charles
    expect(response.body.data[1].name).toStrictEqual(data[2].name) // Jane
    expect(response.body.data[2].name).toStrictEqual(data[0].name) // John Doe

    expect(response.body.pagination.page).toStrictEqual(1)
    expect(response.body.pagination.page_size).toStrictEqual(10)
    expect(response.body.pagination.page_count).toStrictEqual(1)
    expect(response.body.pagination.total_document).toStrictEqual(3)
  })
  it('sort data in descending order', async () => {
    const organizationFactory = new OrganizationFactory(DatabaseTestUtil.dbConnection)
    const data = [
      {
        name: 'John Doe',
      },
      {
        name: 'Charles',
      },
      {
        name: 'Jane',
      },
    ]
    organizationFactory.sequence(data)
    await organizationFactory.createMany(3)

    const response = await request(app).get(`/v1/organizations`).query({
      sort: '-name',
    })

    // expect http response
    expect(response.statusCode).toEqual(200)

    // expect response json
    expect(response.body.data.length).toStrictEqual(3)
    expect(response.body.data[0].name).toStrictEqual(data[0].name) // John Doe
    expect(response.body.data[1].name).toStrictEqual(data[2].name) // Jane
    expect(response.body.data[2].name).toStrictEqual(data[1].name) // Charles

    expect(response.body.pagination.page).toStrictEqual(1)
    expect(response.body.pagination.page_size).toStrictEqual(10)
    expect(response.body.pagination.page_count).toStrictEqual(1)
    expect(response.body.pagination.total_document).toStrictEqual(3)
  })
  it('navigate pagination', async () => {
    const organizationFactory = new OrganizationFactory(DatabaseTestUtil.dbConnection)
    await organizationFactory.createMany(3)

    const organizations = await DatabaseTestUtil.retrieveAll('organizations')

    const response = await request(app).get(`/v1/organizations`).query({
      page: 2,
      page_size: 2,
    })

    // expect http response
    expect(response.statusCode).toEqual(200)

    // expect response json
    expect(response.body.data.length).toStrictEqual(1)
    expect(response.body.data[0].name).toStrictEqual(organizations.data[2].name)

    expect(response.body.pagination.page).toStrictEqual(2)
    expect(response.body.pagination.page_size).toStrictEqual(2)
    expect(response.body.pagination.page_count).toStrictEqual(2)
    expect(response.body.pagination.total_document).toStrictEqual(3)
  })
  it('choose fields', async () => {
    const organizationFactory = new OrganizationFactory(DatabaseTestUtil.dbConnection)
    await organizationFactory.createMany(3)

    const organizations = await DatabaseTestUtil.retrieveAll('organizations')

    const response = await request(app).get(`/v1/organizations`).query({
      fields: 'name',
    })

    // expect http response
    expect(response.statusCode).toEqual(200)

    // expect response json
    expect(response.body.data.length).toStrictEqual(3)
    expect(response.body.data[0]._id).toBeDefined()
    expect(response.body.data[1]._id).toBeDefined()
    expect(response.body.data[2]._id).toBeDefined()
    expect(response.body.data[0].name).toStrictEqual(organizations.data[0].name)
    expect(response.body.data[1].name).toStrictEqual(organizations.data[1].name)
    expect(response.body.data[2].name).toStrictEqual(organizations.data[2].name)
    expect(response.body.data[0].status).toBeUndefined()
    expect(response.body.data[1].status).toBeUndefined()
    expect(response.body.data[2].status).toBeUndefined()
    expect(response.body.data[0].created_date).toBeUndefined()
    expect(response.body.data[1].created_date).toBeUndefined()
    expect(response.body.data[2].created_date).toBeUndefined()

    expect(response.body.pagination.page).toStrictEqual(1)
    expect(response.body.pagination.page_size).toStrictEqual(10)
    expect(response.body.pagination.page_count).toStrictEqual(1)
    expect(response.body.pagination.total_document).toStrictEqual(3)
  })
})
