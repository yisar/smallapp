import { diff } from './diff'
import channel from './channel'

export function app (config) {
  let setup = config.setup

  return delegator(new Worker(getPathname()),channel,setup)
}

function delegator(worker,channel,callback){


}

function getPathname() {
  var scripts = document.getElementsByTagName('script')
  return scripts[scripts.length - 1].src
}