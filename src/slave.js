import { sadism } from './master'
import { createElement } from './dom'
let oldVnode = null

export function masochism (worker, config) {
  // 首次渲染在 slave 中做
  worker.postMessage(0)
  function patch (e) {
    let patches = JSON.parse(e.data)
    for (const i in patches) {
      let op = patches[i]
      if (op.length === 1) {
      }
    }
  }
  worker.onmessage = patch
}

export function app (config) {
  if (MAIN) {
    if (oldVnode == null) {
      const setup = config.setup
      let rootVnode = setup()
      document.body.appendChild(createElement(rootVnode))
    } else {
      const worker = new Worker(PATHNAME)
      // masochism(worker, config)
    }
  } else {
    // sadism(config)
  }
}

const MAIN = typeof window !== 'undefined'
const PATHNAME =
  MAIN &&
  (function () {
    const scripts = document.getElementsByTagName('script')
    return scripts[scripts.length - 1].src
  })()
