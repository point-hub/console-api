import type { ICreateOutput, ICreateRepository, ISchemaValidation } from '@point-hub/papi'

import { OrganizationEntity } from '../entity'
import { createValidation } from '../validations/create.validation'

export interface IInput {
  name?: string
  address?: string
  phone?: string
  application_id?: string
}
export interface IDeps {
  cleanObject(object: object): object
  createRepository: ICreateRepository
  schemaValidation: ISchemaValidation
}
export interface IOptions {
  session?: unknown
}

export class CreateOrganizationUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<ICreateOutput> {
    // 1. validate schema
    await deps.schemaValidation(input, createValidation)
    // 2. define entity
    const organizationEntity = new OrganizationEntity({
      name: input.name,
      address: input.address,
      phone: input.phone,
    })
    organizationEntity.generateCreatedDate()
    const cleanEntity = deps.cleanObject(organizationEntity.data)
    // 3. database operation
    const response = await deps.createRepository.handle(cleanEntity, options)
    return { inserted_id: response.inserted_id }
  }
}
