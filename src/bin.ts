import {Command} from 'commander'

import {VERSION} from './constants'

import {enroll} from './bin/enroll'
import {updateConfig, updateController} from './bin/update-config'
import {button} from './button'

const program = new Command()

program
  .option('--enroll <key>', 'Enrollment Key')
  .option('-c, --controller <url>', 'Controller URL')
  .option('-s, --start', 'Start the Sounder')
  .option('-u, --update-config', 'Update config from the controller')
  .version(VERSION)

program.parse(process.argv)

const options = program.opts()

if (options.enroll) {
  if (!options.controller) {
    throw new Error('Controller URL must be set')
  }

  void enroll(options.enroll, options.controller)
}

if (options.controller && !options.enroll) {
  void updateController(options.controller)
}

if (options.updateConfig) {
  void updateConfig()
}

if (options.start) {
  void button()
}
