import { diff } from './diff'
import channel from './channel'

export function app (config) {
  let setup = config.setup

  return delegator(new Worker(PATHNAME), channel, setup)
}

function delegator (worker, channel, callback) {}

var PATHNAME = (function () {
  var scripts = document.getElementsByTagName('script')
  return scripts[scripts.length - 1].src
})()
