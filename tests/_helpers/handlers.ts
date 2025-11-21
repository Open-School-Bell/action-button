import {http, HttpResponse} from 'msw'
import {faker} from '@faker-js/faker'

export const handlers = [
  http.post('*/button-api/enroll', async () => {
    return HttpResponse.json({
      id: faker.string.uuid(),
      name: faker.internet.username()
    })
  }),
  http.post('*/button-api/ping', async () => {
    return HttpResponse.json({ping: 'pong'})
  }),
  http.post('*/button-api/get-config', async () => {
    return HttpResponse.json({
      id: faker.string.uuid(),
      name: faker.internet.username()
    })
  }),
  http.post('*/button-api/log', async () => {
    return HttpResponse.json({status: 'ok'})
  }),
  http.post('*/button-api/get-audio', async () => {
    return HttpResponse.json([])
  })
]
