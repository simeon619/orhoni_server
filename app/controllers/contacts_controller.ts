/* eslint-disable @typescript-eslint/naming-convention */
import Contact from '#models/contact'
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { applyOrderBy } from './Tools/utils.js'

export default class ContactsController {
  public async create_contact({ request, response }: HttpContext) {
    const data = request.only([
      'user_id',
      'type', // 'phone' ou 'link'
      'use',
      'phone',
    ])

    try {
      const contact = await Contact.create(data)
      return response.status(201).json({
        message: 'Contact créé avec succès',
        data: contact,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la création du contact',
        error: error.message,
      })
    }
  }

  public async get_contact({ params, response, auth }: HttpContext) {
    const { page = 1, limit = 10, order_by = 'date_desc', contact_id, user_id } = params
    try {
      if (contact_id) {
        const contact = await Contact.findBy('user_id', contact_id)

        if (!contact) {
          return response.status(404).json({
            message: 'Contact non trouvé',
          })
        }

        return response.status(200).json({
          message: 'Contact récupéré avec succès',
          data: contact.$attributes,
        })
      }

      let query = db.from(Contact.table).select('*')
      // .innerJoin('users', 'users.id', 'contacts.user_id')
      // .where('user_id', user.id)
      if (user_id) {
        query = query.where('user_id', user_id)
      } else {
        const user = await auth.authenticate()
        query = query.where('user_id', user.id)
      }
      if (order_by) {
        query = applyOrderBy(query, order_by, Contact.table)
      }

      const contacts = await query.paginate(page, limit)
      return response.status(200).json({
        message: 'Contacts récupérés avec succès',
        data: contacts,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la récupération des contacts',
        error: error.message,
      })
    }
  }

  public async update_contact({ request, response }: HttpContext) {
    const contact_id = request.input('contact_id')
    try {
      const contact = await Contact.find(contact_id)

      if (!contact) {
        return response.status(404).json({
          message: 'Contact non trouvé',
        })
      }

      const data = request.only([
        'user_id',
        'type', // 'phone' ou 'link'
        'use',
        'phone',
      ])

      contact.merge(data)
      await contact.save()

      return response.status(200).json({
        message: 'Contact mis à jour avec succès',
        data: contact,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la mise à jour du contact',
        error: error.message,
      })
    }
  }

  public async delete_contact({ params, response }: HttpContext) {
    try {
      const contact = await Contact.find(params.contact_id)

      if (!contact) {
        return response.status(404).json({
          message: 'Contact non trouvé',
        })
      }

      await contact.delete()

      return response.status(200).json({
        message: 'Contact supprimé avec succès',
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la suppression du contact',
        error: error.message,
      })
    }
  }
}
