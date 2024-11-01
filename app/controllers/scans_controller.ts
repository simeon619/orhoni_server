/* eslint-disable @typescript-eslint/naming-convention */
import Scan from '#models/scan'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { v4 } from 'uuid'
const { applyOrderBy, IMG_EXT } = await import('./Tools/utils.js')
const { createFiles } = await import('./Tools/FileManager/create_files.js')
const { updateFiles } = await import('./Tools/FileManager/update_files.js')

export default class ScansController {
  public async create_scan({ request, response }: HttpContext) {
    const data = request.only(['trackable_id', 'address_id', 'message', 'contacts', 'is_opened'])
    const id = v4()
    const photosUrl = await createFiles({
      request,
      column_name: 'photos',
      table_id: id,
      table_name: Scan.table,
      options: {
        throwError: false,
        min: 1,
        max: 7,
        extname: ['jpg', 'jpeg', 'webp'],
        maxSize: 12 * 1024 * 1024,
      },
    })
    try {
      const scan = await Scan.create({ ...data, id, photos: JSON.stringify(photosUrl) })
      scan.$attributes.id = id
      return response.status(201).json({
        message: 'Scan créé avec succès',
        data: scan.$attributes,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la création du scan',
        error: error.message,
      })
    }
  }

  public async get_scan({ request, response, auth }: HttpContext) {
    const { page = 1, limit = 10, order_by = 'date_desc', scan_id, trackable_id } = request.qs()
    try {
      let query = db.from(Scan.table).select('*')
      // .innerJoin('users', 'users.id', 'scans.user_id')
      // .where('user_id', user.id)

      if (scan_id) {
        query = query.where('id', scan_id)
      }
      if (trackable_id) {
        query = query.where('trackable_id', trackable_id)
      }
      if (order_by) {
        query = applyOrderBy(query, order_by, Scan.table)
      }
      const scans = await query.paginate(page, limit)
      return response.status(200).json({
        message: 'Scans récupérés avec succès',
        data: scans,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la récupération des scans',
        error: error.message,
      })
    }
  }

  public async update_scan({ request, response }: HttpContext) {
    const scan_id = request.input('scan_id')
    const body = request.all()
    try {
      const scan = await Scan.find(scan_id)
      if (!scan) {
        return response.status(404).json({
          message: 'Scan non trouvé',
        })
      }

      // if(user.id !== scan.)
      const data = request.only(['trackable_id', 'address_id', 'message', 'contacts', 'is_opened'])

      let urls: string[]
      urls = await updateFiles({
        request,
        table_name: Scan.table,
        table_id: scan.id,
        column_name: 'photos',
        lastUrls: (scan as any)['photos'],
        newPseudoUrls: body['photos'],
        options: {
          throwError: false,
          min: 1,
          max: 7,
          extname: IMG_EXT,
          maxSize: 12 * 1024 * 1024,
        },
      })
      if (urls.length) scan['photos'] = JSON.stringify(urls)
      scan.merge({ ...data })
      await scan.save()

      return response.status(200).json({
        message: 'Scan mis à jour avec succès',
        data: scan,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la mise à jour du scan',
        error: error.message,
      })
    }
  }

  public async delete_scan({ params, response }: HttpContext) {
    try {
      const scan = await Scan.find(params.id)

      if (!scan) {
        return response.status(404).json({
          message: 'Scan non trouvé',
        })
      }

      await scan.delete()

      return response.status(200).json({
        message: 'Scan supprimé avec succès',
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la suppression du scan',
        error: error.message,
      })
    }
  }
}
