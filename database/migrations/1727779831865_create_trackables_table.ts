import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'trackables'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      table.uuid('user_id').references('id').inTable('users')
      table.string('photos')
      table.string('category')
      table.string('type')
      table.string('name')
      table.string('sexe')
      table.string('skin_color')
      table.string('age')
      table.string('height')
      table.string('weight')
      table.string('food_preference')
      table.string('health')
      table.string('description')
      table.string('qr_code')

      table.integer('index')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
