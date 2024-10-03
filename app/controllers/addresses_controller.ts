/* eslint-disable @typescript-eslint/naming-convention */
import Address from '#models/address'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { v4 } from 'uuid'
import { applyOrderBy } from './Tools/utils.js'

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

  public async get_address({ request, response, auth }: HttpContext) {
    const { address_id, name, order_by, page = 1, limit = 10, user_id } = request.qs()

    try {
      if (address_id) {
        const address = await Address.find(address_id)
        if (!address) {
          return response.status(404).json({
            message: 'Adresse non trouvée',
          })
        }
        return response.status(200).json({
          message: 'Adresse trouvé',
          data: address.$attributes,
        })
      }
      let query = db.from(Address.table).select('*')

      if (user_id) {
        //TO_DO ADMIN
        query = query.where('user_id', user_id)
      } else {
        const user = await auth.authenticate()
        query = query.where('user_id', user.id)
      }

      if (address_id) {
        query = query.where('id', address_id)
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

  public async update_address({ request, response }: HttpContext) {
    try {
      const address_id = request.input('address_id')
      const address = await Address.find(address_id)

      if (!address) {
        return response.status(404).json({
          message: 'Adresse non trouvée',
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

  public async delete_address({ params, response }: HttpContext) {
    try {
      const address = await Address.find(params.address_id)

      if (!address) {
        return response.status(404).json({
          message: 'Adresse non trouvée',
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
