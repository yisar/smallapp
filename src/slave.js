import { sadism } from './master'
import { targetMap } from './reactivity'
import { createElement, handlers } from './dom'
let activeEffectStack = []

function effect (fn) {
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
    instance.render = instance.setup()

    instance.update = effect(function componentEffects () {
      if (!mounted) {
        document.body.appendChild(createElement(instance.render()))
        mounted = true
      } else {
        const oldVnode = instance.subTree || null
        const newVnode = (instance.subTree = instance.render())
        document.body.innerHTML = ''
        document.body.appendChild(createElement(newVnode))
      }
    })

    instance.update()
  } else {
    sadism(instance)
  }
}
export function trigger (target, key) {
  let deps = targetMap.get(target)
  const effects = new Set()

  deps.get(key).forEach(e => effects.add(e))

  effects.forEach(e => e())

  const worker = new Worker(PATHNAME)
  worker.postMessage(0)
}

export function track (target, key) {
  const effect = activeEffectStack[activeEffectStack.length - 1]
  if (effect) {
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if (!dep) {
      depsMap.set(key, (dep = new Set()))
    }
    if (!dep.has(effect)) {
      dep.add(effect)
    }
  }
}

const MAIN = typeof window !== 'undefined'
const PATHNAME =
  MAIN &&
  (function () {
    const scripts = document.getElementsByTagName('script')
    return scripts[scripts.length - 1].src
  })()
