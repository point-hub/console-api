import type { IRetrieveOutput, IRetrieveRepository } from '@point-hub/papi'

export interface IInput {
  _id: string
}
export interface IDeps {
  retrieveRepository: IRetrieveRepository
}
export interface IOptions {}

export class RetrieveProjectUseCase {
  static async handle(input: IInput, deps: IDeps, options?: IOptions): Promise<IRetrieveOutput> {
    const response = await deps.retrieveRepository.handle(input._id, options)
    return {
      _id: response._id,
      name: response.name,
      web_restrictions: response.web_restrictions,
      ip_address_restrictions: response.ip_address_restrictions,
      prefix_api_key: response.prefix_api_key,
      created_date: response.created_date,
      updated_date: response.updated_date,
    }
  }
}
