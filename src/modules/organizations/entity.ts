import { IOrganizationEntity } from './interface'

export const collectionName = 'organizations'

export class OrganizationEntity {
  constructor(public data: IOrganizationEntity) {}

  public generateCreatedDate() {
    this.data.created_date = new Date()
  }

  public generateUpdatedDate() {
    this.data.updated_date = new Date()
  }
}
