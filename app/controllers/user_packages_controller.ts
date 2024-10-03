import UserPackage from '#models/user_package'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class UserPackagesController {
  public async create_user_package({ request, response, auth }: HttpContext) {
    const user = await auth.authenticate()

    const data = request.only(['package_id', 'start_date', 'end_date'])

    try {
      const userPackage = await UserPackage.create({ ...data, user_id: user.id })
      return response.status(201).json({
        message: 'Package utilisateur créé avec succès',
        data: userPackage.$attributes,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la création du package utilisateur',
        error: error.message,
      })
    }
  }

  public async get_user_package({ response, auth }: HttpContext) {
    const user = await auth.authenticate()
    try {
      let query = db
        .from(UserPackage.table)
        // .select('*')
        // .innerJoin('users', 'users.id', 'user_packages.user_id')
        .where('user_id', user.id)
      const userPackage = await query.first()
      if (!userPackage) {
        return response.status(404).json({
          message: 'Package utilisateur non trouvé',
        })
      }

      return response.status(200).json({
        message: 'Package utilisateur récupéré avec succès',
        data: userPackage.$attributes,
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
