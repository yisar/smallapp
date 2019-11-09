import { diff } from './diff'
import channel from './channel'
import { PATHNAME } from './slave'

export function app (config) {
  let setup = config.setup

  return delegator(new Worker(PATHNAME), channel, setup)
}

function delegator (worker, channel, callback) {}
