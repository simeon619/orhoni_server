import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['phone'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '30 days',
    prefix: 'oat_',
    table: 'auth_access_tokens',
    type: 'auth_token',
    tokenSecretLength: 40,
  })

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string | null

  @column()
  declare package_id: string

  @column()
  declare photos: string

  @column()
  declare phone: string | null

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime | null

  public static ParseData(user: User['$attributes']) {
    let photos = []
    try {
      photos = JSON.parse(user.photos || '[]')
    } catch (error) {
      console.error(error)
    }
    return {
      ...(user.$attributes || user),
      photos,
      password: undefined,
    } as any as User['$attributes']
  }
}
