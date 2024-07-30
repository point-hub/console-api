import type { ICreateManyOutput, ICreateManyRepository, ISchemaValidation } from '@point-hub/papi'

import { OrganizationEntity } from '../entity'
import { createManyValidation } from '../validations/create-many.validation'

export interface IInput {
  organizations: {
    name?: string
    phone?: string
  }[]
}
export interface IDeps {
  cleanObject(object: object): object
  schemaValidation: ISchemaValidation
  createManyRepository: ICreateManyRepository
}
export interface IOptions {
  session?: unknown
}

export class CreateManyOrganizationUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<ICreateManyOutput> {
    const entities = []
    for (const document of input.organizations) {
      const organizationEntity = new OrganizationEntity({
        name: document.name,
        phone: document.phone,
      })
      organizationEntity.generateCreatedDate()
      entities.push(deps.cleanObject(organizationEntity.data))
    }
    await deps.schemaValidation({ organizations: entities }, createManyValidation)
    const response = await deps.createManyRepository.handle(entities, options)
    return {
      inserted_ids: response.inserted_ids,
      inserted_count: response.inserted_count,
    }
  }
}
