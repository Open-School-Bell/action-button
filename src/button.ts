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

// Add _destroyed to Timeouts
type Timeout = NodeJS.Timeout & {
  _destroyed: boolean
}

export const button = async () => {
  await log(`🚀 Launching Button`)
  await writeFile(
    path.join(process.cwd(), 'button.pid'),
    process.pid.toString()
  )

  await updateConfig()
  let config = await getConfig()

  const ledInterface = led(config.ledPin)

  const minutely = async () => {
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
  }
  await minutely()

  cron.schedule('* * * * *', minutely)

  let buttonInterface = new Gpio(config.buttonPin, 'in', 'both', {
    debounceTimeout: 10
  })

  const buttonHandlers = (btn: Gpio) => {
    let triggerTimeout: Timeout | null = null
    let holdTimeout: Timeout | null = null
    let cancelled: boolean = false

    btn.watch(async (err, value) => {
      if (err) {
        await log(`⚠️ Button read error`)
        return
      }

      if (value === 1) {
        // Button has been pressed.
        await log('👇 Button Pressed')
        if (triggerTimeout && !triggerTimeout._destroyed) {
          // There is currently a trigger timeout, clear it and return the LED to on.
          clearTimeout(triggerTimeout)
          ledInterface.setLEDState('on')
          cancelled = true
          await log(`❌ Action Cancelled`)
          return
        }

        // No trigger timeout, check for hold duration
        if (config.holdDuration > 0) {
          // Hold duration is greater than 0.
          holdTimeout = setTimeout(() => {
            ledInterface.setLEDState('off')
          }, config.holdDuration * 1000) as Timeout
        }
      }

      if (value === 0) {
        // Button has been released
        await log('☝️ Button Released')
        if (holdTimeout && !holdTimeout._destroyed) {
          // There is a hold timeout that can be cleared
          clearTimeout(holdTimeout)
          return
        }

        // No Hold timeout (or timeout has passed), check the cancel duration
        if (config.cancelDuration > 0) {
          if (cancelled) {
            cancelled = false
            return
          }

          // There is a cancel duration, set a timeout for the trigger
          triggerTimeout = setTimeout(async () => {
            await log('🚀 Triggering Action after cancel period')
            await buttonApi('/trigger', {})
            ledInterface.setLEDState('on')
          }, config.cancelDuration * 1000) as Timeout
          ledInterface.setLEDState('rapid_flash')

          return
        }

        // No cancel duration, trigger now
        await log('🚀 Triggering Action on button press')
        await buttonApi('/trigger', {})

        return
      }
    })
  }

  buttonHandlers(buttonInterface)
}
