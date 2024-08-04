import { IUserEntity } from './interface'

export const collectionName = 'users'

export class UserEntity {
  constructor(public data: IUserEntity) {
    this.trimmedEmail()
    this.trimmedUsername()
  }

  public trimmedUsername() {
    this.data.trimmed_username = this.data.username?.split(' ').join('').toLocaleLowerCase()
  }

  public trimmedEmail() {
    if (!this.data.email) {
      return
    }
    // separate prefix / username and domain
    let prefix = this.data.email.split('@')[0]
    const domain = this.data.email.split('@')[1]
    // remove dot
    prefix = prefix.split('.').join('')
    // remove email subaddressing, also known as plus sign (+) trick,
    // is popularized by Gmail and now supported by most email providers
    prefix = prefix.split('+')[0]
    // combine prefix and domain
    this.data.trimmed_email = `${prefix.toLocaleLowerCase()}@${domain.toLocaleLowerCase()}`
  }

  public generateCreatedDate() {
    this.data.created_date = new Date()
  }

  public generateUpdatedDate() {
    this.data.updated_date = new Date()
  }
}
