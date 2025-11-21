import {Gpio, type High, type Low} from 'onoff'

type LEDStates = 'off' | 'on' | 'slow_flash' | 'rapid_flash'
type LEDAction = High | Low

const FLASH_INTERVAL = 250

export const led = (
  initialPin: number
): {
  setLEDState: (newState: LEDStates) => void
  setLEDPin: (newPin: number) => void
  ledState: LEDStates
  dispose: () => void
} => {
  /** The current state of the LED */
  let LED_STATE: LEDStates = 'off'
  let gpioInterface = new Gpio(initialPin, 'out')
  gpioInterface.writeSync(0)

  /** Set the LED to the provided state.  */
  const setLEDState = (ledState: LEDStates) => {
    LED_STATE = ledState
  }

  const setLEDPin = (pin: number) => {
    gpioInterface.unexport()
    gpioInterface = new Gpio(pin, 'out')
  }

  const dispose = () => {
    gpioInterface.unexport()
  }

  let previous: LEDAction = 0
  const interval = setInterval(() => {
    const current = gpioInterface.readSync()
    switch (LED_STATE) {
      case 'on':
        // If the LED State is on and the LED is currently not on, switch it on.
        if (current !== 1) {
          gpioInterface.writeSync(1)
        }
        break
      case 'off':
        // If the LED State is off and the LED is currently not off, switch it off.
        if (current !== 0) {
          gpioInterface.writeSync(0)
        }
        break
      case 'rapid_flash':
        // Always switch the LED to the opposite state.
        gpioInterface.writeSync(current === 1 ? 0 : 1)
        break
      case 'slow_flash':
        // If this interval and the previous interval had the same value, switch.
        if (previous === current) {
          gpioInterface.writeSync(current === 1 ? 0 : 1)
        }
        break
    }

    previous = current
  }, FLASH_INTERVAL)

  return {setLEDState, setLEDPin, ledState: LED_STATE, dispose}
}
