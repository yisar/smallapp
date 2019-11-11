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
  instance.render = instance.setup()
  if (MAIN) {
    const worker = new Worker(PATHNAME)
    instance.update = effect(function componentEffects () {
      const oldVnode = instance.subTree || null
      const newVnode = (instance.subTree = instance.render())
      worker.postMessage(JSON.stringify({ oldVnode, newVnode }))
      document.body.innerHTML = ''
      document.body.appendChild(createElement(instance.render()))
    })
    instance.update()
  } else {
    self.onmessage = e => {
      let { oldVnode, newVnode } = JSON.parse(e.data)
      diff(oldVnode, newVnode)
    }
  }
}

function diff (oldVnode, newVnode) {
  console.log(oldVnode, newVnode)
}

export function trigger (target, key) {
  let deps = targetMap.get(target)
  const effects = new Set()

  deps.get(key).forEach(e => effects.add(e))

  effects.forEach(e => e())
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
