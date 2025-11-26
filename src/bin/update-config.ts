import fs from 'fs'
import path from 'path'

import {getConfig, type Config} from '../utils/config'
import {log} from '../utils/log'
import {buttonApi} from '../utils/button-api'

const {writeFile} = fs.promises

export const updateConfig = async (
  writeToLog: boolean = false
): Promise<Config> => {
  const config = await getConfig()

  await buttonApi('/ping', {})

  const response = await buttonApi('/get-config', {})

  if (!response) return config

  const {controller, key} = config

  const result = await response.json()

  const content = JSON.stringify({...result, controller, key}, null, ' ')

  await writeFile(path.join(process.cwd(), 'button.json'), content)
  if (writeToLog) {
    await log(`✅ Config updated!`)
  }

  return {...result, controller, key}
}

export const updateController = async (newController: string) => {
  const config = await getConfig()

  config.controller = newController

  await writeFile(
    path.join(process.cwd(), 'button.json'),
    JSON.stringify(config)
  )
  await log(`✅ Controller updated!`)
}
