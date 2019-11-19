import { trigger, track, targetMap } from './master'
const toProxy = new WeakMap()
const toRaw = new WeakMap()

const isObj = obj => typeof obj === 'object'

export function reactive (target) {
  if (!isObj(target)) return target

  let proxy = toProxy.get(target)
  if (proxy) return proxy

  if (toRaw.has(target)) return target

  const handlers = {
    get (target, key, receiver) {
      let newValue = target[key]

      if (isObj(newValue)) {
        return reactive(res)
      }
      let res = Reflect.get(target, key, receiver)
      track(target, key)
      return res
    },
    set (target, key, value, receiver) {
      let res = Reflect.set(target, key, value, receiver)
      if (key in target) trigger(target, key)
      return res
    },
    deleteProperty () {
      return Reflect.defineProperty(target, key)
    }
  }

  let observed = new Proxy(target, handlers)

  toProxy.set(target, observed)
  toRaw.set(observed, target)

  if (!targetMap.has(target)) {
    targetMap.set(target, new Map())
  }

  return observed
}
