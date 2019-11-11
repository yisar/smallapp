import { sadism } from './master'
import { targetMap } from './reactivity'
import { createElement, handlers } from './dom'
let activeEffectStack = []

function effect (fn) {
  const effect = createReactiveEffect(fn)
  return effect
}

function createReactiveEffect (fn) {
  const effect = function effect (...args) {
    return run(effect, fn, args)
  }
  return effect
}

function run (effect, fn, args) {
  if (activeEffectStack.indexOf(effect) === -1) {
    try {
      activeEffectStack.push(effect)
      return fn(...args)
    } finally {
      activeEffectStack.pop()
    }
  }
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
        const oldVnode = instance.subTree || null
        const newVnode = (instance.subTree = renderComponent(instance))

        diff(oldVnode,newVnode)
      }
    })

    instance.update()
  } else {
    sadism(instance)
  }
}

function renderComponent (instance) {
  currentInstance = instance
  return instance.type(instance.props)
}

export function trigger (target, key) {
  let deps = targetMap.get(target)

  const effects = new Set()

  deps.get(key).forEach(e => effects.add(e))

  effects.forEach(e => e())

  const worker = new Worker(PATHNAME)
  worker.postMessage(0)
}

const MAIN = typeof window !== 'undefined'
const PATHNAME =
  MAIN &&
  (function () {
    const scripts = document.getElementsByTagName('script')
    return scripts[scripts.length - 1].src
  })()
