import { masochism } from './slave'
import { sadism } from './master'

const MAIN = typeof window !== 'undefined'
const PATHNAME =
  MAIN &&
  (function () {
    const scripts = document.getElementsByTagName('script')
    return scripts[scripts.length - 1].src
  })()

export function app (config) {
  if (MAIN) {
    const worker = new Worker(PATHNAME)
    masochism(worker, config)
  } else {
    sadism(config)
  }
}
