import fs from 'fs'
import path from 'path'

const {readFile} = fs.promises

export type Config = {
  key: string
  controller: string
  name: string
  id: string
  ledPin: number
  buttonPin: number
  holdDuration: number
  cancelDuration: number
  lockdown: boolean
}

export const getConfig = async (): Promise<Config> => {
  const content = await readFile(path.join(process.cwd(), 'button.json'))

  const config = JSON.parse(content.toString())

  return config
}
