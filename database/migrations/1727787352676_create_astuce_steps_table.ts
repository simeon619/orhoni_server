import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'astuce_steps'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id')

      table.uuid('astuce_id').references('id').inTable('astuces').onDelete('CASCADE')

      table.string('title')
      table.string('subtitle')
      table.string('description')
      table.string('images')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
