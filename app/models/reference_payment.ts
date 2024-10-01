import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class ReferencePayment extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare status: string

  @column()
  declare package_id: string

  @column()
  declare user_id: string

  @column()
  declare amount: number

  @column()
  declare devise: string

  @column()
  declare start_date: string

  @column()
  declare end_date: string

  @column()
  declare method_payment: string

  @column()
  declare link_receipt: string

  @column()
  declare country_payment: string

  @column()
  declare more_info_payment: string

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime
}
