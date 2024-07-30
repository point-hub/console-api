export interface IOrganizationEntity {
  _id?: string
  name?: string
  address?: string
  phone?: string
  applications?: IOrganizationApplication[]
  created_date?: Date
  updated_date?: Date
}

export interface IOrganizationApplication {
  _id?: string
  application_id?: string
  name?: string
  users?: IApplicationUser[]
  created_date?: Date
  updated_date?: Date
}

export interface IApplicationUser {
  _id?: string
  user_id?: string
  name?: string
  created_date?: Date
  updated_date?: Date
}
