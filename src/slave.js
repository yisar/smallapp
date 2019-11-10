import { TEXT } from './h'
import { sadism } from './master'

export function masochism (worker, config) {
  worker.postMessage(0)
  function patch (e) {
    let patches = JSON.parse(e.data)
    for (const i in patches) {
      let op = patches[i]
      if (op.length === 1) {
        document.body.appendChild(createElement(op[0]))
      }
    }
  }
  worker.onmessage = patch
}

function createElement (vnode) {
  let dom = vnode.tag === TEXT ? document.createTextNode(vnode.type) : document.createElement(vnode.type)
  if (vnode.children) {
    for (let i = 0; i < vnode.children.length; i++) {
      dom.appendChild(createElement(vnode.children[i]))
    }
  }
  return dom
}

export function app (config) {
  if (MAIN) {
    const worker = new Worker(PATHNAME)
    masochism(worker, config)
  } else {
    sadism(config)
  }
}


const MAIN = typeof window !== 'undefined'
const PATHNAME =
  MAIN &&
  (function () {
    const scripts = document.getElementsByTagName('script')
    return scripts[scripts.length - 1].src
  })()