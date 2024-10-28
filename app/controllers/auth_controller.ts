/* eslint-disable @typescript-eslint/naming-convention */
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { v4 } from 'uuid'
const { updateFiles } = await import('./Tools/FileManager/update_files.js')

export default class AuthController {
  // public static async _create_user({
  //   phone,
  //   avatarUrl = '/src/res/user-fill.png',
  //   password,
  //   name,
  //   mode,
  // }: {
  //   name: string
  //   password: string
  //   avatarUrl?: string
  //   phone: string
  //   mode: 'login' | 'signup' | 'dual'
  // }) {
  //   let user = await User.findBy('phone', phone)
  //   let token: string | undefined
  //   if (user) {
  //     if (mode === 'signup') {
  //       throw new Error('Email Not Avalaible')
  //     }
  //     console.log('auth 1')

  //     // if (user.status == USER_STATUS.NEW) {
  //     //     user.password = password;
  //     //     user.photos = JSON.stringify([avatarUrl]);
  //     //     user.full_name = full_name;
  //     //     user.status = USER_STATUS.VISIBLE
  //     //     await user.save();
  //     //     return User.ParseUser(user);
  //     // }

  //     const valid = await hash.verify(user.password, password)
  //     if (!valid) throw new Error('Unauthorized access..')
  //     let Atoken = await User.accessTokens.create(user)
  //     token = Atoken.value?.release()
  //     return {
  //       token,
  //       ...User.ParseData(user),
  //     }
  //     // response
  //     //     .redirect()
  //     //     .toPath(`${env.get('FRONT_ORIGINE')}/auth#=${JSON.stringify()
  //     //         }`);
  //   } else {
  //     if (mode === 'login') {
  //       throw new Error('Account Do Not Exist')
  //     }
  //     console.log('auth 4')

  //     const user_id = v4()
  //     user = await User.create({
  //       id: user_id,
  //       phone,
  //       name: name,
  //       password: password,
  //       // status: USER_STATUS.VISIBLE,
  //       photos: JSON.stringify([avatarUrl]),
  //     })

  //     user.id = user_id
  //     user.$attributes.id = user_id
  //     //await _create_client( {name, email, password}, auth )
  //     let Atoken = await User.accessTokens.create(user)
  //     token = Atoken.value?.release()
  //     console.log('auth 5', token)

  //     return {
  //       token,
  //       ...User.ParseData(user),
  //       photos: JSON.parse(user.photos || '[]'),
  //     }
  //   }
  // }

  // public async google_connexion({ ally }: HttpContext) {
  //   return ally.use('google').redirect()
  // }

  public async delete_user_account({ auth, params }: HttpContext) {
    const user_id = params.id
    const user = await auth.authenticate()
    AuthController._golbal_disconnection(user, params.id)

    if (user_id /*&& admin / moderator*/) {
      const tagetUser = await User.find(user_id)
      if (!tagetUser) return 'user not found'
      await tagetUser.delete()
      return {
        isDeleted: tagetUser.$isDeleted,
      }
    } else {
      await user.delete()
      return {
        isDeleted: user.$isDeleted,
      }
    }
  }
  public async disconnection({ auth, response }: HttpContext) {
    const user = await auth.authenticate()
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    return response.status(200).json({
      message: 'disconnected',
    })
  }
  // public async global_disconnection({ request, auth }: HttpContext) {
  //   const { user_id } = request.qs()
  //   const user = await auth.authenticate()
  //   return AuthController._golbal_disconnection(user, user_id)
  // }

  public static async _golbal_disconnection(user: User, user_id?: string) {
    if (user_id /*&& admin / moderator*/) {
      const tagetUser = await User.find(user_id)
      if (!tagetUser) return 'user not found'
      const tokens = await User.accessTokens.all(tagetUser)
      for (const token of tokens) {
        await User.accessTokens.delete(tagetUser, token.identifier)
      }
    } else {
      const tokens = await User.accessTokens.all(user)
      for (const token of tokens) {
        await User.accessTokens.delete(user, token.identifier)
      }
    }
    return {
      disconnection: true,
    }
  }

  public async phone_connexion({ request, response }: HttpContext) {
    const data = request.only(['phone', 'password'])
    if (!data.phone) return response.status(400).json({ message: 'phone is required' })
    const exist_user = await User.findBy('phone', data.phone)
    if (exist_user) {
      let Atoken = await User.accessTokens.create(exist_user)
      const token = Atoken.value?.release()
      return response.status(200).json({
        message: 'Account récupéré avec succès',
        data: {
          token,
          ...User.ParseData(exist_user),
        },
      })
    }
    const user_id = v4()
    try {
      if (!data.phone || !data.password)
        return response.status(400).json({ message: 'phone and password are required' })
      let user = await User.create({
        id: user_id,
        phone: data.phone,
        password: data.password,
      })

      user.id = user_id
      user.$attributes.id = user_id
      let Atoken = await User.accessTokens.create(user)
      const token = Atoken.value?.release()

      return response.status(201).json({
        message: 'Account cree avec succes',
        data: {
          token,
          ...User.ParseData(user),
        },
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erreur lors de la creation du compte',
        error: error.message,
      })
    }
  }

  // public async update

  // public async google_push_info({ ally, response }: HttpContext) {
  //   const provider = ally.use('google')
  //   console.log({ google: 'google_push_info' })

  //   if (provider.accessDenied()) {
  //     throw new Error('google access was denied')
  //   }

  //   if (provider.stateMisMatch()) {
  //     throw new Error('google request expired. Retry again')
  //   }
  //   if (provider.hasError()) {
  //     throw new Error(provider.getError() || 'provider.hasError()')
  //   }
  //   const { id, email, avatarUrl, name } = await provider.user()

  //   if (!email) {
  //     throw new Error('google request user email')
  //   }
  //   let data
  //   const query = db
  //     .from(UserSocialAuth.table)
  //     .select('*')
  //     .where('social_diff', email)
  //     .andWhere('social_name', 'google')

  //   const social_auth = (await query.first()) as UserSocialAuth
  //   if (social_auth) {
  //     const user = await User.find(social_auth.user_id)
  //     data = user
  //   } else {
  //     const idV4 = v4()

  //     await UserSocialAuth.create({
  //       id: v4(),
  //       user_id: idV4,
  //       password: id,
  //       social_diff: email,
  //       social_name: 'google',
  //     })

  //     const user = await User.create({
  //       id: idV4,
  //       name,
  //       password: id,
  //       photos: JSON.stringify([avatarUrl]),
  //       phone: null,
  //     })
  //     data = user
  //   }

  //   // const query = db
  //   //   .from(UserSocialAuth.table)
  //   //   .select('*')
  //   //   .where('social_diff', email)
  //   //   .andWhere('password', id)
  //   // const idV4 = v4()
  //   // const socialAuth = await query.first()
  //   // if (socialAuth) {
  //   //   //   return response.status(201)
  //   // } else {
  //   //   const data = await UserSocialAuth.create({
  //   //     user_id: idV4,
  //   //     password: id,
  //   //     social_diff: email,
  //   //   })

  //   // }
  //   // const social
  //   // let data: any = await AuthController._create_user({
  //   //   email,
  //   //   password: id,
  //   //   full_name: name,
  //   //   mode: 'dual',
  //   //   avatarUrl,
  //   // })

  //   response.send(`
  //       <!DOCTYPE html>
  //       <html lang="en">

  //       <head>
  //           <meta charset="UTF-8">
  //           <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //           <title>Document</title>
  //       </head>

  //       <body>

  //           <script type="module">
  //               const user = ${JSON.stringify(data)}
  //               window.addEventListener('DOMContentLoaded', () => {
  //                   try{
  //                   const u =  JSON.stringify(user);
  //                   localStorage.setItem('user',u)
  //                   localStorage.setItem('token',${JSON.stringify(data.token)})
  //                   }catch(error){ console.log(error)}
  //                   window.close();
  //               })
  //           </script>

  //       </body>

  //       </html>
  //       `)
  // }

  // public async create_user({ request }: HttpContext) {
  //   const { mode = 'signup', email = '' as string, password } = request.body()

  //   return AuthController._create_user({
  //     email,
  //     full_name: email.substring(0, email.indexOf('@')),
  //     password,
  //     mode,
  //   })
  // }

  async me({ response, auth }: HttpContext) {
    const user = await auth.authenticate()
    let Atoken = await User.accessTokens.create(user)
    const token = Atoken.value?.release()
    return response.status(201).json({
      message: 'Account récupéré avec succès',
      data: {
        token,
        ...User.ParseData(user),
      },
    })
    // setBrowser(user, request)
    // let address = await Address.findBy('context', user.id)
    // let phone = await Phone.findBy('context', user.id)
    // return {
    //   ...User.ParseData(user),
    //   // token:  request.headers().authorization?.split(' ')[1]
    // }
  }

  async edit_me({ request, auth }: HttpContext) {
    const body = request.body()
    const user = await auth.authenticate()

    ;(['name'] as const).forEach((attribute) => {
      if (body[attribute]) user[attribute] = body[attribute]
    })

    for (const f of ['photos'] as const) {
      if (body[f]) {
        const urls = await updateFiles({
          request,
          table_name: 'users',
          table_id: user.id,
          column_name: f,
          lastUrls: user[f] || '[]',
          newPseudoUrls: body[f],
          options: {
            throwError: true,
            min: 1,
            max: 7,
            compress: 'img',
            extname: [
              'jpg',
              'jpeg',
              'jfif',
              'pjpeg',
              'pjp',
              'avif',
              'apng',
              'gif',
              'jpg',
              'png',
              'jpeg',
              'webp',
            ],
            maxSize: 12 * 1024 * 1024,
          },
        })
        console.log('🚀 ~ AuthController ~ edit_me ~ urls:', urls)
        if (urls[0]) {
          user['photos'] = JSON.stringify(urls[0])
        }
      }
    }

    await user.save()

    return {
      ...User.ParseData(user.$attributes),
    }
  }
  // async get_users({ request, auth }: HttpContext) {
  //   const {
  //     page,
  //     limit,
  //     full_name,
  //     email,
  //     phone,
  //     user_id,
  //     order_by,
  //     text,
  //     count_pet,
  //     count_code,
  //     add_pet,
  //     add_code,
  //     add_rating,
  //   } = paginate(
  //     request.qs() as { page: number | undefined; limit: number | undefined } & { [k: string]: any }
  //   )

  //   let query = db.query().from(User.table).select('*')
  //   if (user_id) {
  //     query = query.whereLike('id', `%${user_id}%`)
  //   } else {
  //     if (text) {
  //       if (text.startsWith('#')) {
  //         query = query.whereLike('users.id', `%${text.replaceAll('#', '')}%`)
  //       } else {
  //         query = query.andWhere((q) => {
  //           const v = `%${text.split('').join('%')}%`
  //           q.whereLike('email', v).orWhereLike('full_name', v)
  //         })
  //       }
  //     } else {
  //       if (email) {
  //         query = query.andWhereLike('email', `%${email.split('').join('%')}%`)
  //       }
  //       if (phone) {
  //         query = query.andWhereLike('phone', `%${phone.split('').join('%')}%`)
  //       }
  //       if (full_name) {
  //         query = query.andWhereLike('full_name', `%${full_name.split('').join('%')}%`)
  //       }
  //     }
  //   }

  //   const l = await limitation(query, page, limit, order_by)
  //   const users = (await l.query).map((u) => User.ParseUser(u))

  //   const promises = users.map(
  //     (u) =>
  //       new Promise(async (rev) => {
  //         const phone = await Phone.findBy('context', u.id)
  //         u.phone = phone?.$attributes
  //         let address = await Address.findBy('context', u.id)
  //         u.address = address?.$attributes
  //         if (add_rating) {
  //           const rating = await Rating.findBy('user_id', u.id)
  //           u.rating = rating
  //         }
  //         if (count_code || add_code) {
  //           const codes = await CodesController._get_codes({ user_id: u.id }, auth)
  //           u.codes = count_code ? codes.total : codes
  //         }
  //         if (count_pet || add_pet) {
  //           const animals = await AnimalsController._get_animals({ user_id: u.id }, auth)
  //           u.animals = count_pet ? animals.total : animals
  //         }
  //         rev(null)
  //       })
  //   )
  //   await Promise.allSettled(promises)
  //   return {
  //     ...l.paging,
  //     list: users,
  //   }
  // }
}
