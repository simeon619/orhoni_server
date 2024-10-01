import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class AstuceStep extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare astuce_id: string

  @column()
  declare title: string

  @column()
  declare subtitle: string

  @column()
  declare description: string

  @column()
  declare images: string

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime
}
