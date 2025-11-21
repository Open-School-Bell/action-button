import {getConfig} from './config'

export const buttonApi = async (path: string, payload: object) => {
  const {key, controller} = await getConfig()

  const response = await fetch(`${controller}/button-api${path}`, {
    method: 'post',
    body: JSON.stringify({
      key,
      ...payload
    })
  }).catch(() => {
    console.log(`⚠️ Unable to contact controller`)
  })

  return response
}
