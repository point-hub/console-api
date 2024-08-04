export interface IUserEntity {
  _id?: string
  name?: string
  username?: string
  trimmed_username?: string // for checking unique username by ignoring spaces
  email?: string
  trimmed_email?: string // for checking unique email by ignoring dot and +
  email_verification_code?: string
  is_email_verified?: boolean
  password?: string
  created_date?: Date
  updated_date?: Date
  oauth?: {
    pointhub?: {
      name?: string
      username?: string
      email?: string
      tokens: {
        _id?: string
        token_type?: string
        access_token?: string
        refresh_token?: string
        scope?: string
        expiry_date?: number
      }[]
    }
  }
}

export interface IUserToken {
  application_id?: string
  user_id?: string
  access_token?: string
  refresh_token?: string
}
