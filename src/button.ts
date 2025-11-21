import cron from 'node-cron'
import fs from 'fs'
import path from 'path'
import {Gpio, type High, type Low} from 'onoff'

import {log} from './utils/log'
import {led} from './utils/led'
import {getConfig} from './utils/config'
import {updateConfig} from './bin/update-config'
import {buttonApi} from './utils/button-api'
import {VERSION} from './constants'

const {writeFile} = fs.promises

export const button = async () => {
  await log(`🚀 Launching Button`)
  await writeFile(
    path.join(process.cwd(), 'sounder.pid'),
    process.pid.toString()
  )

  let config = await getConfig()

  const ledInterface = led(config.ledPin)

  cron.schedule('* * * * *', async () => {
    const pongResponse = await buttonApi('/ping', {version: VERSION})

    if (!pongResponse) {
      ledInterface.setLEDState('off')
    } else {
      if (ledInterface.ledState !== 'on') {
        ledInterface.setLEDState('on')
      }
    }

    const newConfig = await updateConfig()

    if (newConfig.ledPin !== config.ledPin) {
      ledInterface.setLEDPin(newConfig.ledPin)
    }

    if (newConfig.lockdown !== config.lockdown) {
      ledInterface.setLEDState(newConfig.lockdown ? 'slow_flash' : 'on')
    }

    config = {...newConfig}
  })

  let buttonInterface = new Gpio(config.buttonPin, 'in', 'both', {
    debounceTimeout: 10
  })

  const buttonHandlers = (btn: Gpio) => {
    let triggerTimeout: NodeJS.Timeout | null = null
    let holdTimeout: NodeJS.Timeout | null = null

    btn.watch(async (err, value) => {
      if (err) {
        await log(`⚠️ Button read error`)
        return
      }

      if (value === 1) {
        // Button has been pressed.
        if (triggerTimeout) {
          // There is currently a trigger timeout, clear it and return the LED to on.
          clearTimeout(triggerTimeout)
          ledInterface.setLEDState('on')
          await log(`❌ Action Cancelled`)
          return
        }

        // No trigger timeout, check for hold duration
        if (config.holdDuration > 0) {
          // Hold duration is greater than 0.
          holdTimeout = setTimeout(() => {
            ledInterface.setLEDState('off')
          }, config.holdDuration)
        }
      }

      if (value === 0) {
        // Button has been released
        if (holdTimeout) {
          // There is a hold timeout that can be cleared
          clearTimeout(holdTimeout)
          return
        }

        // No Hold timeout (or timeout has passed), check the cancel duration
        if (config.cancelDuration) {
          // There is a cancel duration, set a timeout for the trigger
          triggerTimeout = setTimeout(async () => {
            await buttonApi('/trigger', {})
            ledInterface.setLEDState('on')
          }, config.cancelDuration)
          ledInterface.setLEDState('rapid_flash')

          return
        }

        // No cancel duration, trigger now
        await buttonApi('/trigger', {})

        return
      }
    })
  }

  buttonHandlers(buttonInterface)
}
