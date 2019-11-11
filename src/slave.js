import { sadism } from './master'
import { createElement, handlers } from './dom'
let oldVnode = null
let oldVm = null
let currentInstance = null

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

export function app (instance) {
  if (MAIN) {
    let mounted = false

    instance.update = effect(function componentEffects () {
      if (!mounted) {
        const newVnode = instance.setup()
        document.body.appendChild(createElement(newVnode))
        mounted = true
      } else {
        // update
        const oldVnode = instance.subTree
        const newVnode = (instance.subTree = renderComponent(instance))
      }
    })
  } else {
    sadism(instance)
  }
}

function renderComponent(instance){
  currentInstance = instance
  return instance.type(instance.props)
}

let targetMap = new Map()

export function trigger (target, key) {
  let deps = targetMap.get(target)
  const worker = new Worker(PATHNAME)
  console.log(oldVm.setup())
  worker.postMessage(0)
}

const MAIN = typeof window !== 'undefined'
const PATHNAME =
  MAIN &&
  (function () {
    const scripts = document.getElementsByTagName('script')
    return scripts[scripts.length - 1].src
  })()
