import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Scan extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare trackable_id: string

  @column()
  declare address_id: string

  @column()
  declare photos: string

  @column()
  declare message: string

  @column()
  declare contacts: string

  @column()
  declare is_opened: boolean

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime
}
