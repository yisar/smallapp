import { targetMap } from './reactivity'
import { masochism } from './slave'
import { EVENT } from './dom'
import { handlerMap } from './h'
const MAIN = typeof window !== 'undefined'
const activeEffectStack = []

export function app (instance) {
  instance.render = instance.setup()
  MAIN ? masochism() : sadism(instance)
}

function sadism (instance) {
  instance.update = effect(function componentEffects () {
    const oldVnode = instance.subTree || null
    const newVnode = (instance.subTree = instance.render())
    let commit = diff(0, null, null, newVnode)
    self.postMessage(commit)
  })
  instance.update()
  self.addEventListener('message', e => {
    const { type, id } = e.data
    if (type === EVENT) {
      const fn = handlerMap[id - 1]
      fn && fn()
      instance.update()
    }
  })
}

function diff (parent, node, oldVnode, newVnode) {
  const commitQueue = []
  if (oldVnode === newVnode) {
  } else if (!oldVnode || oldVnode.type !== newVnode.type) {
    commitQueue.push([parent, node, newVnode])
  }
  return commitQueue
}

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
