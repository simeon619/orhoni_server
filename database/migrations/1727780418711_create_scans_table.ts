import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'scans'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      table.uuid('trackable_id').references('id').inTable('trackables')
      table.uuid('address_id').references('id').inTable('addresses')
      table.string('photos')
      table.string('message')
      table.string('contacts')
      table.boolean('is_opened')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
