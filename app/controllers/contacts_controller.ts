/* eslint-disable @typescript-eslint/naming-convention */
import Contact from '#models/contact'
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { v4 } from 'uuid'
const { applyOrderBy } = await import('./Tools/utils.js')

export default class ContactsController {
  public async create_contact({ request, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    const data = request.only([
      'type', // 'phone' ou 'link'
      'use',
      'phone',
    ])
    const id = v4()
    try {
      const contact = await Contact.create({ ...data, user_id: user.id, id })
      contact.$attributes.id = id
      return response.status(201).json({
        message: 'Contact créé avec succès',
        data: contact.$attributes,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la création du contact',
        error: error.message,
      })
    }
  }

  public async get_contacts({ request, response, auth }: HttpContext) {
    const { page = 1, limit = 10, order_by = 'date_desc', contact_id, user_id } = request.qs()
    const isAuth = await auth.check()
    try {
      let query = db.from(Contact.table).select('*')
      if (user_id) {
        //TO DO ADMIN
        query = query.where('user_id', user_id)
      } else if (isAuth) {
        const user = await auth.authenticate()
        query = query.where('user_id', user.id)
      } else if (contact_id) {
        query = query.where('id', contact_id)
      } else {
        return response.status(400).json({
          message: "Veuillez fournir l'identifiant du contact",
        })
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

  public async update_contact({ request, response, auth }: HttpContext) {
    const contact_id = request.input('contact_id')
    try {
      const user = await auth.authenticate()
      const contact = await Contact.find(contact_id)

      if (!contact) {
        return response.status(404).json({
          message: 'Contact non trouvé',
        })
      }

      if (user.id !== contact.user_id) {
        return response.status(403).json({
          message: "Vous n'avez pas le droit d'éditer ce contact",
        })
      }
      const data = request.only([
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

  public async delete_contact({ params, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    try {
      const contact = await Contact.find(params.id)

      if (!contact) {
        return response.status(404).json({
          message: 'Contact non trouvé',
        })
      }
      if (user.id !== contact.user_id) {
        return response.status(403).json({
          message: "Vous n'avez pas le droit de supprimer ce contact",
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
