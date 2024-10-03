import webpush from 'web-push'

import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

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
