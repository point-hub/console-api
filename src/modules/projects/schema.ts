/**
 * MongoDB Schema
 *
 * https://www.mongodb.com/docs/v6.0/core/schema-validation/update-schema-validation/
 * https://www.mongodb.com/docs/drivers/node/current/fundamentals/indexes/
 * https://www.mongodb.com/developer/products/mongodb/mongodb-schema-design-best-practices/
 */

import type { ISchema } from '@point-hub/papi'

import { collectionName } from './entity'

export const schema: ISchema[] = [
  {
    collection: collectionName,
    required: ['name'],
    unique: [['name']],
    uniqueIfExists: [[]],
    schema: {
      bsonType: 'object',
      required: ['name', 'organization_id'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'The name for the project',
        },
        organization_id: {
          bsonType: 'string',
          description: 'The organization for the project',
        },
      },
    },
  },
]
