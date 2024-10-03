/* eslint-disable @typescript-eslint/naming-convention */
import User from '#models/user'
import UserPackage from '#models/user_package'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class UserPackagesController {
  public async _create_user_package({
    user,
    data,
  }: {
    user: User
    data: { package_id: string; start_date: any; end_date: any }
  }) {
    // const user = await auth.authenticate()

    // const data = request.only(['package_id', 'start_date', 'end_date'])

    const userPackage = await UserPackage.create({ ...data, user_id: user.id })
    return userPackage.$attributes
  }

  public async get_user_packages({ response, auth, request }: HttpContext) {
    const { user_id, limit = 10, page = 1, package_id } = request.qs()
    try {
      let query = db.from(UserPackage.table)
      if (user_id) {
        //TO DO ADMIN
        query = query.where('user_id', user_id)
      } else {
        const user = await auth.authenticate()
        query = query.where('user_id', user.id)
      }
      if (package_id) {
        query = query.where('id', package_id)
      }

      const userPackage = await query.paginate(page, limit)
      if (!userPackage) {
        return response.status(404).json({
          message: 'Package utilisateur non trouvé',
        })
      }

      return response.status(200).json({
        message: 'Package utilisateur récupéré avec succès',
        data: userPackage,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la récupération des packages utilisateurs',
        error: error.message,
      })
    }
  }

  public async update_user_package({ request, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    try {
      const userPackage = await UserPackage.findBy('user_id', user.id)

      if (!userPackage) {
        return response.status(404).json({
          message: 'Package utilisateur non trouvé',
        })
      }

      const data = request.only(['start_date', 'end_date', 'package_id'])

      userPackage.merge({ ...data })
      await userPackage.save()

      return response.status(200).json({
        message: 'Package utilisateur mis à jour avec succès',
        data: userPackage.$attributes,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la mise à jour du package utilisateur',
        error: error.message,
      })
    }
  }

  public async delete_user_package({ params, response }: HttpContext) {
    try {
      const userPackage = await UserPackage.find(params.user_package_id)

      if (!userPackage) {
        return response.status(404).json({
          message: 'Package utilisateur non trouvé',
        })
      }

      await userPackage.delete()

      return response.status(200).json({
        message: 'Package utilisateur supprimé avec succès',
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la suppression du package utilisateur',
        error: error.message,
      })
    }
  }
}
