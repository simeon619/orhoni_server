import webpush from 'web-push'

import { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const AuthController = () => import('#controllers/auth_controller')
const TrackablesController = () => import('#controllers/trackables_controller')
const UserPackagesController = () => import('#controllers/user_packages_controller')
const ScansController = () => import('#controllers/scans_controller')
const PackagesController = () => import('#controllers/packages_controller')
const ContactsController = () => import('#controllers/contacts_controller')
const AstucesController = () => import('#controllers/astuces_controller')
const AddressesController = () => import('#controllers/addresses_controller')

//Auth
router.post('/phone_connexion', [AuthController, 'phone_connexion'])
router.get('/me', [AuthController, 'me'])
router.post('/edit_me', [AuthController, 'edit_me'])
router.get('/disconnection', [AuthController, 'disconnection'])
router.delete('/delete_user_account/:id', [AuthController, 'delete_user_account'])

//Adresses
router.post('/create_address', [AddressesController, 'create_address'])
router.get('/get_addresses', [AddressesController, 'get_addresses'])
router.put('/update_address', [AddressesController, 'update_address'])
router.delete('/delete_address/:id', [AddressesController, 'delete_address'])

//Astuces
router.post('/create_astuce', [AstucesController, 'create_astuce'])
router.get('/get_astuces', [AstucesController, 'get_astuces'])
router.put('/update_astuce', [AstucesController, 'update_astuce'])
router.delete('/delete_astuce/:id', [AstucesController, 'delete_astuce'])

router.post('/create_astuce_step', [AstucesController, 'create_astuce_step'])
router.put('/update_astuce_step', [AstucesController, 'update_astuce_step'])
router.get('/get_astuce_steps/:id', [AstucesController, 'get_astuce_steps'])

//Contacts
router.post('/create_contact', [ContactsController, 'create_contact'])
router.get('/get_contacts', [ContactsController, 'get_contacts'])
router.put('/update_contact', [ContactsController, 'update_contact'])
router.delete('/delete_contact/:id', [ContactsController, 'delete_contact'])

//Packages
router.post('/create_package', [PackagesController, 'create_package'])
router.get('/get_packages', [PackagesController, 'get_packages'])
router.put('/update_package', [PackagesController, 'update_package'])
router.delete('/delete_package/:id', [PackagesController, 'delete_package'])

//UserPackages
router.get('/get_user_packages', [UserPackagesController, 'get_user_packages'])
router.put('/update_user_package', [UserPackagesController, 'update_user_package'])
router.delete('/delete_user_package/:id', [UserPackagesController, 'delete_user_package'])

//Scans
router.post('/create_scan', [ScansController, 'create_scan'])
router.get('/get_scan', [ScansController, 'get_scan'])
router.put('/update_scan', [ScansController, 'update_scan'])
router.delete('/delete_scan/:id', [ScansController, 'delete_scan'])

//Trackables
router.post('/create_trackable', [TrackablesController, 'create_trackable'])
router.get('/get_trackables', [TrackablesController, 'get_trackables'])
router.put('/update_trackable', [TrackablesController, 'update_trackable'])
router.delete('/delete_trackable/:id', [TrackablesController, 'delete_trackable'])

router
  .get('/try_token', async () => {
    return {
      valid: true,
    }
    // try {
    //   await auth.authenticate()
    //   return response.status(200).json({
    //     message: 'Token validé avec succès',
    //   })
    // } catch (error) {
    //   return response.status(401).json({
    //     message: 'Token non valide ou expiré' + error.message,
    //   })
    // }
  })
  .use(middleware.auth())

const publicVapidKey =
  'BDwYyNLBYIyNOBFX3M27uTAUXLrUxgHVyBJPjxJj3aQR7ghxC_MetHpzgTspdk4e4Iq9E0LCzeAtbCPOcdclxCk'
const privateVapidKey = 'rOHBJ0AGjSf37QW-mPRScGNr_0Bqn6Ouk-1nQPUUPpI'

webpush.setVapidDetails('mailto:sublymus@gmail.com', publicVapidKey, privateVapidKey)

const list: any[] = []
router.post('/add_context_notifier', ({ request, response }) => {
  // Get pushSubscription object
  const subscription = request.body()
  list.push(subscription)
  // Send 201 - resource created
  response.status(201).json({})
  // Create payload
  // webpush.sendNotification(subscription as any, payload).catch(err => console.error(err));
  // Pass object into sendNotification
  setTimeout(() => {
    list.forEach((s) => {
      // console.log('Push ==>> ', {

      // });
      console.log(s)

      const payload = JSON.stringify({ title: 'new Message', content: 'Push Content' })
      webpush.sendNotification(s as any, payload).catch((err) => console.error(err))
    })
  }, 1000)
})
