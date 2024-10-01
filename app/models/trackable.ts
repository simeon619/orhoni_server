import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Trackable extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare user_id: string

  @column()
  declare photo: string

  @column()
  declare category: string

  @column()
  declare type: string

  @column()
  declare name: string

  @column()
  declare sexe: string

  @column()
  declare skin_color: string

  @column()
  declare age: string

  @column()
  declare height: string

  @column()
  declare weight: string

  @column()
  declare food_preference: string

  @column()
  declare health: string

  @column()
  declare description: string

  @column()
  declare qr_code: string

  @column()
  declare index: string

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime
}
