/* eslint-disable @typescript-eslint/naming-convention */
import Astuce from '#models/astuce'
import AstuceStep from '#models/astuce_step'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { v4 } from 'uuid'
const { IMG_EXT } = await import('./Tools/utils.js')
// import { createFiles } from './Tools/FileManager/CreateFiles.js'
// import { updateFiles } from './Tools/FileManager/UpdateFiles.js'
const { createFiles } = await import('./Tools/FileManager/create_files.js')
const { updateFiles } = await import('./Tools/FileManager/update_files.js')

export default class AstucesController {
  public async create_astuce({ request, response }: HttpContext) {
    //TODO ADMIN
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
      astuce.$attributes.id = id
      return response.status(201).json({
        message: 'Astuce créée avec succès',
        data: astuce.$attributes,
      })
    } catch (error) {
      return response.status(500).json({
        message: "Erreur lors de la création de l'astuce",
        error: error.message,
      })
    }
  }

  public async get_astuces({ request, response }: HttpContext) {
    //TO DO ADMIN
    const { astuce_id, page = 1, limit = 5, title } = request.qs()
    try {
      let query = db.from(Astuce.table)
      if (astuce_id) {
        query = query.where('id', astuce_id)
      }
      if (title) {
        query = query.where('title', 'like', `%${title}%`)
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
    //TO DO ADMIN
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
        table_name: Astuce.table,
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
        table_name: Astuce.table,
        table_id: astuce.id,
        column_name: 'icon',
        lastUrls: (astuce as any)['icon'],
        newPseudoUrls: body['icon'],
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
    //TO DO ADMIN
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
    //TO DO ADMIN
    const data = request.only(['astuce_id', 'title', 'subtitle', 'description'])

    if (data.astuce_id) {
      const astuce = await Astuce.find(data.astuce_id)
      if (!astuce) {
        return response.status(404).json({
          message: 'Astuce non trouvée, vous devez cree une astuce pour la définir',
        })
      }
    }
    const id = v4()
    const photosUrl = await createFiles({
      request,
      column_name: 'images',
      table_id: id,
      table_name: AstuceStep.table,
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
      astuceStep.$attributes.id = id
      return response.status(201).json({
        message: "Étape d'astuce créée avec succès",
        data: astuceStep.$attributes,
      })
    } catch (error) {
      return response.status(500).json({
        message: "Erreur lors de la création de l'étape d'astuce",
        error: error.message,
      })
    }
  }
  public async update_astuce_step({ request, response }: HttpContext) {
    //TO DO ADMIN
    const astuce_step_id = request.input('astuce_step_id')
    try {
      const astuceStep = await AstuceStep.find(astuce_step_id)
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
        table_name: AstuceStep.table,
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
  public async delete_astuce_step({ params, response }: HttpContext) {
    //TO DO ADMIN
    try {
      const astuceStep = await AstuceStep.find(params.id)

      if (!astuceStep) {
        return response.status(404).json({
          message: "Étape d'astuce non trouvée",
        })
      }

      await astuceStep.delete()
      return response.status(200).json({
        message: "Étape d'astuce supprimée avec succès",
      })
    } catch (error) {
      return response.status(500).json({
        message: "Erreur lors de la suppression de l'étape d'astuce",
        error: error.message,
      })
    }
  }
}
