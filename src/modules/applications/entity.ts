import { IApplicationEntity } from './interface'

export const collectionName = 'applications'

export class ApplicationEntity {
  constructor(public data: IApplicationEntity) {}

  public generateCreatedDate() {
    this.data.created_date = new Date()
  }

  public generateUpdatedDate() {
    this.data.updated_date = new Date()
  }
}
