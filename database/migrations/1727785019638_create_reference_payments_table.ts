import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'reference_payments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      table.string('status')
      table.string('package_id')
      table.string('user_id')
      table.integer('amount')
      table.string('devise')
      table.string('start_date')
      table.string('end_date')
      table.string('method_payment')
      table.string('link_receipt')
      table.string('country_payment')
      table.string('more_info_payment')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
