/* eslint-disable @typescript-eslint/naming-convention */
import Address from '#models/address'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { v4 } from 'uuid'
const { applyOrderBy } = await import('./Tools/utils.js')

export default class AddressesController {
  public async create_address({ request, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    const data = request.only(['longitude', 'latitude', 'name', 'address', 'icon', 'real_position'])
    const id = v4()
    try {
      const address = await Address.create({ ...data, user_id: user.id, id })
      return response.status(201).json({
        message: 'Adresse créée avec succès',
        data: { ...address.$attributes, id },
      })
    } catch (error) {
      return response.status(500).json({
        message: "Erreur lors de la création de l'adresse",
        error: error.message,
      })
    }
  }

  public async get_addresses({ request, response, auth }: HttpContext) {
    const { address_id, name, order_by, page = 1, limit = 10, user_id } = request.qs()
    const isAuth = await auth.check()
    try {
      let query = db.from(Address.table).select('*')

      if (user_id) {
        //TO_DO ADMIN
        query = query.where('user_id', user_id)
      } else if (isAuth) {
        const user = await auth.authenticate()
        query = query.where('user_id', user.id)
      } else if (address_id) {
        query = query.where('id', address_id)
      } else {
        return response.status(400).json({
          message: "Veuillez fournir l'identifiant de l'adresse",
        })
      }

      if (order_by) {
        query = applyOrderBy(query, order_by, Address.table)
      }

      if (name) {
        const regex = `%${name.toLowerCase()}%`
        query = query.andWhere((q) => {
          q.whereRaw('LOWER(adresses.name) LIKE ?', [regex]).orWhereRaw(
            'LOWER(adresses.description) LIKE ?',
            [regex]
          )
        })
      }
      const addresses = await query.paginate(page, limit)
      addresses.getMeta()
      return response.status(200).json({
        message: 'Adresses récupérées avec succès',
        data: addresses,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la récupération des adresses',
        error: error.message,
      })
    }
  }

  public async update_address({ request, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const address_id = request.input('address_id')
      const address = await Address.find(address_id)

      if (!address) {
        return response.status(404).json({
          message: 'Adresse non trouvée',
        })
      }

      if (user.id !== address.user_id) {
        return response.status(403).json({
          message: "Vous n'avez pas le droit d'éditer cette adresse",
        })
      }
      const data = request.only([
        'longitude',
        'latitude',
        'name',
        'address',
        'icon',
        'real_position',
      ])

      address.merge(data)
      await address.save()

      return response.status(200).json({
        message: 'Adresse mise à jour avec succès',
        data: address,
      })
    } catch (error) {
      return response.status(500).json({
        message: "Erreur lors de la mise à jour de l'adresse",
        error: error.message,
      })
    }
  }

  public async delete_address({ params, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    try {
      const address = await Address.find(params.id)

      if (!address) {
        return response.status(404).json({
          message: 'Adresse non trouvée',
        })
      }
      if (user.id !== address.user_id) {
        return response.status(403).json({
          message: "Vous n'avez pas le droit de supprimer cette adresse",
        })
      }
      await address.delete()

      return response.status(200).json({
        message: 'Adresse supprimée avec succès',
      })
    } catch (error) {
      return response.status(500).json({
        message: "Erreur lors de la suppression de l'adresse",
        error: error.message,
      })
    }
  }
}
