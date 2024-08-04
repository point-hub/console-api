import type { ICreateOutput, ICreateRepository, ISchemaValidation } from '@point-hub/papi'

import { ProjectEntity } from '../entity'
import { createValidation } from '../validations/create.validation'

export interface IInput {
  name?: string
  web_restrictions?: string[]
  ip_address_restrictions?: string[]
}
export interface IDeps {
  cleanObject(object: object): object
  createRepository: ICreateRepository
  schemaValidation: ISchemaValidation
  generateProject(): string
  hashProject(string: string): string
}
export interface IOptions {
  session?: unknown
}

export class CreateProjectUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<ICreateOutput> {
    // 1. validate schema
    await deps.schemaValidation(input, createValidation)
    // 2. define entity
    const apiKey = deps.generateProject()
    const hashedProject = deps.hashProject(apiKey)
    const exampleEntity = new ProjectEntity({
      name: input.name,
      web_restrictions: input.web_restrictions,
      ip_address_restrictions: input.ip_address_restrictions,
      prefix_api_key: apiKey.substring(0, 6),
      hashed_api_key: hashedProject,
    })
    exampleEntity.generateCreatedDate()
    const cleanEntity = deps.cleanObject(exampleEntity.data)
    // 3. database operation
    const response = await deps.createRepository.handle(cleanEntity, options)
    return { inserted_id: response.inserted_id, api_key: apiKey }
  }
}
