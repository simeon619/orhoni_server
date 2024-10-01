import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_packages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      table.uuid('user_id').references('id').inTable('users')
      table.uuid('reference_payment_id').references('id').inTable('reference_payments')
      table.uuid('package_id').references('id').inTable('packages')
      table.timestamp('start_date')
      table.timestamp('end_date')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
