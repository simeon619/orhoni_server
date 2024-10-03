/* eslint-disable @typescript-eslint/naming-convention */
import Astuce from '#models/astuce'
import AstuceStep from '#models/astuce_step'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { v4 } from 'uuid'
import { createFiles } from './Tools/FileManager/CreateFiles.js'
import { updateFiles } from './Tools/FileManager/UpdateFiles.js'
import { IMG_EXT } from './Tools/utils.js'

export default class AstucesController {
  public async create_astuce({ request, response }: HttpContext) {
    const data = request.only(['title', 'subtitle', 'description'])
    let photoUrl = [] as string[]
    let iconUrl = [] as string[]
    const id = v4()
    try {
      photoUrl = await createFiles({
        request,
        column_name: 'background',
        table_id: id,
        table_name: Astuce.table,
        options: {
          throwError: false,
          min: 1,
          max: 7,
          extname: IMG_EXT,
          maxSize: 12 * 1024 * 1024,
        },
      })
      iconUrl = await createFiles({
        request,
        column_name: 'icon',
        table_id: id,
        table_name: Astuce.table,
        options: {
          throwError: false,
          min: 1,
          max: 7,
          extname: IMG_EXT,
          maxSize: 12 * 1024 * 1024,
        },
      })
    } catch (error) {}

    try {
      const astuce = await Astuce.create({
        ...data,
        id,
        background: JSON.stringify(photoUrl),
        icon: JSON.stringify(iconUrl),
      })

      return response.status(201).json({
        message: 'Astuce créée avec succès',
        data: astuce,
      })
    } catch (error) {
      return response.status(500).json({
        message: "Erreur lors de la création de l'astuce",
        error: error.message,
      })
    }
  }

  public async get_astuce({ request, response }: HttpContext) {
    const { astuce_id, page = 1, limit = 5 } = request.qs()
    try {
      if (astuce_id) {
        const pckage = await Astuce.find(astuce_id)

        if (!pckage) {
          return response.status(404).json({
            message: 'Astuce non trouvé',
          })
        }

        return response.status(200).json({
          message: 'Astuce récupéré avec succès',
          data: pckage.$attributes,
        })
      }

      let query = db.from(Astuce.table)
      if (astuce_id) {
        query = query.where('id', astuce_id)
      }
      const astuces = await query.paginate(page, limit)
      return response.status(200).json({
        message: 'Astuces récupérées avec succès',
        data: astuces,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la récupération des astuces',
        error: error.message,
      })
    }
  }

  public async update_astuce({ request, response }: HttpContext) {
    const body = request.all()
    try {
      const astuce = await Astuce.find(body.astuce_id)
      if (!astuce) {
        return response.status(404).json({
          message: 'Astuce non trouvée',
        })
      }

      const data = request.only(['title', 'subtitle', 'description'])
      let urls: string[]
      let icon: string[]
      urls = await updateFiles({
        request,
        table_name: 'products',
        table_id: astuce.id,
        column_name: 'background',
        lastUrls: (astuce as any)['background'],
        newPseudoUrls: body['background'],
        options: {
          throwError: false,
          min: 1,
          max: 7,
          extname: IMG_EXT,
          maxSize: 12 * 1024 * 1024,
        },
      })
      icon = await updateFiles({
        request,
        table_name: 'products',
        table_id: astuce.id,
        column_name: 'background',
        lastUrls: (astuce as any)['background'],
        newPseudoUrls: body['background'],
        options: {
          throwError: false,
          min: 1,
          max: 7,
          extname: IMG_EXT,
          maxSize: 12 * 1024 * 1024,
        },
      })
      if (urls.length) astuce['background'] = JSON.stringify(urls)
      if (icon.length) astuce['icon'] = JSON.stringify(icon)
      astuce.merge(data)
      await astuce.save()

      return response.status(200).json({
        message: 'Astuce mise à jour avec succès',
        data: astuce,
      })
    } catch (error) {
      return response.status(500).json({
        message: "Erreur lors de la mise à jour de l'astuce",
        error: error.message,
      })
    }
  }

  public async delete_astuce({ params, response }: HttpContext) {
    try {
      const astuce = await Astuce.find(params.id)

      if (!astuce) {
        return response.status(404).json({
          message: 'Astuce non trouvée',
        })
      }

      await astuce.delete()

      return response.status(200).json({
        message: 'Astuce supprimée avec succès',
      })
    } catch (error) {
      return response.status(500).json({
        message: "Erreur lors de la suppression de l'astuce",
        error: error.message,
      })
    }
  }

  public async create_astuce_step({ request, response }: HttpContext) {
    const data = request.only(['astuce_id', 'title', 'subtitle', 'description'])
    const id = v4()
    const photosUrl = await createFiles({
      request,
      column_name: 'photos',
      table_id: id,
      table_name: 'scans',
      options: {
        throwError: false,
        min: 1,
        max: 7,
        extname: IMG_EXT,
        maxSize: 12 * 1024 * 1024,
      },
    })
    try {
      const astuceStep = await AstuceStep.create({ ...data, images: JSON.stringify(photosUrl), id })
      return response.status(201).json({
        message: "Étape d'astuce créée avec succès",
        data: { ...astuceStep.$attributes, id },
      })
    } catch (error) {
      return response.status(500).json({
        message: "Erreur lors de la création de l'étape d'astuce",
        error: error.message,
      })
    }
  }
  public async update_astuce_step({ params, request, response }: HttpContext) {
    try {
      const astuceStep = await AstuceStep.find(params.id)
      const body = request.all()
      if (!astuceStep) {
        return response.status(404).json({
          message: "Étape d'astuce non trouvée",
        })
      }

      const data = request.only(['astuce_id', 'title', 'subtitle', 'description'])
      let urls: string[]
      urls = await updateFiles({
        request,
        table_name: 'products',
        table_id: astuceStep.id,
        column_name: 'images',
        lastUrls: (astuceStep as any)['images'],
        newPseudoUrls: body['images'],
        options: {
          throwError: false,
          min: 1,
          max: 7,
          extname: IMG_EXT,
          maxSize: 12 * 1024 * 1024,
        },
      })
      if (urls.length) astuceStep['images'] = JSON.stringify(urls)
      astuceStep.merge(data)
      await astuceStep.save()

      return response.status(200).json({
        message: "Étape d'astuce mise à jour avec succès",
        data: astuceStep,
      })
    } catch (error) {
      return response.status(500).json({
        message: "Erreur lors de la mise à jour de l'étape d'astuce",
        error: error.message,
      })
    }
  }

  public async get_astuce_steps({ response, request }: HttpContext) {
    const { astuce_id } = request.qs()
    try {
      let query = db.from(AstuceStep.table)

      if (astuce_id) {
        query = query.where('id', astuce_id)
      }
      const steps = await query

      return response.status(200).json({
        message: 'Étapes récupérées avec succès',
        data: steps,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la récupération des étapes',
        error: error.message,
      })
    }
  }
}
