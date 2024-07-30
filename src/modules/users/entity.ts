import { IUserEntity } from './interface'

export const collectionName = 'users'

export class UserEntity {
  constructor(public data: IUserEntity) {}

  public generateCreatedDate() {
    this.data.created_date = new Date()
  }

  public generateUpdatedDate() {
    this.data.updated_date = new Date()
  }
}
