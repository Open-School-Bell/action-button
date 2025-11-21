import {buttonApi} from './button-api'

export const log = async (message: string) => {
  console.log(message)
  await buttonApi('/log', {message})
}
