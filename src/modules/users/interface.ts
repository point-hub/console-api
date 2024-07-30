export interface IUserEntity {
  _id?: string
  email?: string
  name?: string
  username?: string
  oauth2s?: IUserOauth2[]
  created_date?: Date
  updated_date?: Date
}

export interface IUserOauth2 {
  provider?: string
  _id?: string
  email?: string
  name?: string
  username?: string
}
