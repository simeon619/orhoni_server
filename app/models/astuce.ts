import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Astuce extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare icon: string

  @column()
  declare background: string

  @column()
  declare title: string

  @column()
  declare subtitle: string

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime
}
