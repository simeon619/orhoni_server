/* eslint-disable @typescript-eslint/naming-convention */
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class UserBrowser extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare user_id: string

  @column()
  declare user_agent: string

  @column()
  declare notification_data: string

  @column()
  declare token: string

  @column()
  declare ip: string

  @column()
  declare enable: boolean

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  public static parseUserBrowser(p: UserBrowser) {
    let notification_data
    try {
      notification_data = JSON.parse((p.$attributes, p).notification_data)
    } catch (error) {}

    return {
      ...(p.$attributes || p),
      notification_data,
    }
  }
}
