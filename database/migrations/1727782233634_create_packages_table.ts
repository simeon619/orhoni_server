import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'packages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      table.string('name')
      table.decimal('price_per_month', 10, 2)
      table.decimal('price_per_year', 10, 2)
      table.string('features')

      table.string('icon')
      table.string('background')
      table.string('description')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
