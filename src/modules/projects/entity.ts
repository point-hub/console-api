import { IProjectEntity } from './interface'

export const collectionName = 'projects'

export class ProjectEntity {
  constructor(public data: IProjectEntity) {}

  public generateCreatedDate() {
    this.data.created_date = new Date()
  }

  public generateUpdatedDate() {
    this.data.updated_date = new Date()
  }
}
