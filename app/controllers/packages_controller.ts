/* eslint-disable @typescript-eslint/naming-convention */
import Package from '#models/package'
import type { HttpContext } from '@adonisjs/core/http'
import { v4 } from 'uuid'
import { createFiles } from './Tools/FileManager/CreateFiles.js'
import { updateFiles } from './Tools/FileManager/UpdateFiles.js'
import { IMG_EXT } from './Tools/utils.js'

export default class PackagesController {
  public async create_package({ request, response }: HttpContext) {
    const data = request.only([
      'name',
      'description',
      'price_per_month',
      'price_per_year',
      'features',
    ])
    const id = v4()
    const photosUrl = await createFiles({
      request,
      column_name: 'background',
      table_id: id,
      table_name: Package.table,
      options: {
        throwError: false,
        min: 1,
        max: 7,
        extname: ['jpg', 'jpeg', 'webp'],
        maxSize: 12 * 1024 * 1024,
      },
    })
    const icon = await createFiles({
      request,
      column_name: 'icon',
      table_id: id,
      table_name: Package.table,
      options: {
        throwError: false,
        min: 1,
        max: 7,
        extname: ['jpg', 'jpeg', 'webp'],
        maxSize: 12 * 1024 * 1024,
      },
    })
    try {
      const pckage = await Package.create({
        ...data,
        background: JSON.stringify(photosUrl),
        icon: JSON.stringify(icon),
        id,
      })

      return response.status(201).json({
        message: 'Package créé avec succès',
        data: pckage.$attributes,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la création du package',
        error: error.message,
      })
    }
  }

  public async get_packages({ request, response }: HttpContext) {
    const { package_id, page = 1, limit = 10 } = request.qs()
    try {
      let query = Package.query()

      if (package_id) {
        query = query.where('id', package_id)
      }
      const packages = await query.paginate(page, limit)

      return response.status(200).json({
        message: 'Packages récupérés avec succès',
        data: packages,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la récupération des packages',
        error: error.message,
      })
    }
  }

  public async update_package({ request, response }: HttpContext) {
    let package_id = request.input('package_id')
    let body = request.all()
    try {
      const pckage = await Package.find(package_id)
      if (!pckage) {
        return response.status(404).json({
          message: 'Package non trouvé',
        })
      }

      const data = request.only([
        'name',
        'description',
        'price_per_month',
        'price_per_year',
        'features',
      ])

      let urls: string[]
      let icon: string[]
      icon = await updateFiles({
        request,
        table_name: Package.table,
        table_id: pckage.id,
        column_name: 'icon',
        lastUrls: (pckage as any)['icon'],
        newPseudoUrls: body['icon'],
        options: {
          throwError: false,
          min: 1,
          max: 7,
          extname: IMG_EXT,
          maxSize: 12 * 1024 * 1024,
        },
      })
      urls = await updateFiles({
        request,
        table_name: Package.table,
        table_id: pckage.id,
        column_name: 'background',
        lastUrls: (pckage as any)['background'],
        newPseudoUrls: body['background'],
        options: {
          throwError: false,
          min: 1,
          max: 7,
          extname: IMG_EXT,
          maxSize: 12 * 1024 * 1024,
        },
      })
      if (urls.length) pckage['background'] = JSON.stringify(urls)
      if (icon.length) pckage['icon'] = JSON.stringify(icon)
      pckage.merge(data)
      await pckage.save()

      return response.status(200).json({
        message: 'Package mis à jour avec succès',
        data: pckage.$attributes,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la mise à jour du package',
        error: error.message,
      })
    }
  }

  public async delete_package({ params, response }: HttpContext) {
    try {
      const pckage = await Package.find(params.package_id)

      if (!pckage) {
        return response.status(404).json({
          message: 'Package non trouvé',
        })
      }
      await pckage.delete()
      return response.status(200).json({
        message: 'Package supprimé avec succès',
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la suppression du package',
        error: error.message,
      })
    }
  }
}
