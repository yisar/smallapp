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
    let commit = diff(0, null, oldVnode, newVnode)
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
    if (oldVnode != null) {
      commitQueue.push([parent, node])
    }
  } else {
    commitQueue.push([null, node, oldVnode.props, newVnode.props])
    let oldKeyed = {}
    let newKeyed = {}
    let oldElements = []
    let oldChildren = oldVnode.children
    let children = newVnode.children

    for (let i = 0; i < oldChildren.length; i++) {
      oldElements[i] = [node, i]
      let oldKey = getKey(oldChildren[i])
      if (oldKey != null) {
        oldKeyed[oldKey] = [oldElements[i], oldChildren[i]]
      }
    }

    let i = 0
    let j = 0

    while (j < children.length) {
      let oldKey = getKey(oldChildren[i])
      let newKey = getKey(children[i])
      if (newKeyed[oldKey]) {
        i++
        commitQueue.push([])
        continue
      }

      if (newKey != null && newKey === getKey(oldChildren[i + 1])) {
        if (oldKey == null) {
          commitQueue.push([element, oldElements[i]])
        }
        i++
        continue
      }

      if (newKey == null) {
        if (oldKey == null) {
          diff(node, oldElements[i], oldChildren[i], children[k])
          k++
        }
        i++
      } else {
        let keyed = oldKeyed[newKey] || []
        if (oldKey === newKey) {
          diff(node, keyed[0], keyed[1], children[k])
          i++
        } else {
          diff(node, oldElements[i], null, children[k])
          newKeyed[newKey] = children[k]
          k++
        }
      }
    }

    while (i < oldChildren.length) {
      if (getKey(oldChildren[i]) == null) {
        commitQueue.push(node, oldElements[i])
      }
      i++
    }

    for (let i in oldKeyed) {
      if (!newKeyed[i]) {
        commitQueue.push(node, oldKeyed[i][0])
      }
    }
  }
  return commitQueue
}

const getKey = node => (node ? node.key : null)

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
