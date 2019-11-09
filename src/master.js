import { diff } from './diff'
import { postMessageToMain } from './channel'

export function app (config) {
  let setup = config.setup

  let newVnode = setup()

  postMessageToMain(diff(null, newVnode))
}
