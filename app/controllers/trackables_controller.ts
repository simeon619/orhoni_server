/* eslint-disable @typescript-eslint/naming-convention */
import Trackable from '#models/trackable'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { v4 } from 'uuid'
import { createFiles } from './Tools/FileManager/CreateFiles.js'
import { updateFiles } from './Tools/FileManager/UpdateFiles.js'
import { applyOrderBy } from './Tools/utils.js'
export default class TrackablesController {
  public async create_trackable({ request, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    const data = request.only([
      'photo',
      'category',
      'type',
      'name',
      'sexe',
      'skin_color',
      'age',
      'height',
      'weight',
      'food_preference',
      'health',
      'description',
      'qr_code',
      //   'index',
    ])
    const id = v4()
    const photosUrl = await createFiles({
      request,
      column_name: 'photos',
      table_id: id,
      table_name: 'trackables',
      options: {
        throwError: false,
        min: 1,
        max: 7,
        extname: ['jpg', 'jpeg', 'webp'],
        maxSize: 12 * 1024 * 1024,
      },
    })
    let myTrackables = await Trackable.query().where('user_id', user.id)
    let nbrTrackable = myTrackables.length || 0
    try {
      const trackable = await Trackable.create({
        ...data,
        index: nbrTrackable + 1,
        id,
        user_id: user.id,
        photos: JSON.stringify(photosUrl),
      })
      return response.status(201).json({
        message: 'Trackable créé avec succès',
        data: trackable,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la création du trackable',
        error: error.message,
      })
    }
  }

  public async get_trackable({ request, response, auth }: HttpContext) {
    const user = await auth.authenticate()

    try {
      const {
        page = 1,
        limit = 10,
        order_by = 'date_asc',
        categories,
        types,
        name,
        trackable_id,
      } = request.qs()
      const _categories = JSON.parse(categories)
      const _type = JSON.parse(types)

      let query = db
        .from(Trackable.table)
        .select('*')
        .innerJoin('users', 'users.id', 'trackables.user_id')
        .where('user_id', user.id)

      if (trackable_id) {
        query = query.where('id', trackable_id)
      }
      if (_categories.length) {
        query = query.whereIn('category', _categories)
      }
      if (order_by) {
        query = applyOrderBy(query, order_by, Trackable.table)
      }

      if (_type.length) {
        query = query.whereIn('type', _type)
      }

      if (name) {
        const text = name.toLowerCase()
        const regex = `%${text}%`
        query = query.andWhere((q) => {
          q.whereRaw('LOWER(trackables.name) LIKE ?', [regex]).orWhereRaw(
            'LOWER(trackables.description) LIKE ?',
            [regex]
          )
        })
      }

      const trackables = await query.paginate(page, limit)

      return response.status(200).json({
        message: 'Trackables récupérés avec succès',
        data: trackables,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la récupération des trackables',
        error: error.message,
      })
    }
  }

  public async update_trackable({ request, response, auth }: HttpContext) {
    const trackable_id = request.input('trackable_id')
    const user = await auth.authenticate()
    const body = request.all()
    try {
      const trackable = await Trackable.find(trackable_id)
      if (!trackable) {
        return response.status(404).json({
          message: 'Trackable non trouvé',
        })
      }
      const data = request.only([
        'category',
        'type',
        'name',
        'sexe',
        'skin_color',
        'age',
        'height',
        'weight',
        'food_preference',
        'health',
        'description',
        'qr_code',
        'index',
      ])
      if (user.id !== trackable.user_id) {
        return response.status(403).json({
          message: "Vous n'avez pas le droit d'editer ce trackable",
        })
      }
      let urls: string[]
      urls = await updateFiles({
        request,
        table_name: 'trackable',
        table_id: trackable.id,
        column_name: 'photo',
        lastUrls: (trackable as any)['photo'],
        newPseudoUrls: body['photo'],
        options: {
          throwError: false,
          min: 1,
          max: 7,
          extname: ['jpg', 'jpeg', 'webp'],
          maxSize: 12 * 1024 * 1024,
        },
      })
      if (urls.length) trackable['photos'] = JSON.stringify(urls)
      trackable.merge(data)
      await trackable.save()

      return response.status(200).json({
        message: 'Trackable mis à jour avec succès',
        data: trackable,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la mise à jour du trackable',
        error: error.message,
      })
    }
  }

  public async delete_trackable({ params, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    try {
      const trackable = await Trackable.find(params.trackable_id)

      if (!trackable) {
        return response.status(404).json({
          message: 'Trackable non trouvé',
        })
      }

      if (user.id !== trackable.user_id) {
        return response.status(403).json({
          message: "Vous n'avez pas le droit de supprimer ce trackable",
        })
      }
      await trackable.delete()
      return response.status(200).json({
        message: 'Trackable supprimé avec succès',
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la suppression du trackable',
        error: error.message,
      })
    }
  }
}
