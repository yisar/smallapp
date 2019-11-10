const PATHNAME = (function () {
  const scripts = document.getElementsByTagName('script')
  return scripts[scripts.length - 1].src
})()

function app (config) {
  dispatch(new Worker(PATHNAME), config.setup)
}

function dispatch (worker, callback) {
  function message (e) {
    console.log(e.data.data)
  }
  worker.onmessage = message
  callback()
}

self.addEventListener(
  'message',
  e => {
    console.log(e)

      self.postMessage(222)
    },
  false
)

const toProxy = new WeakMap()
const toRaw = new WeakMap()
const isObj = obj => typeof obj === 'object'

function trigger () {
  console.log('update')
}

function reactive (target) {
  if (!isObj(target)) return target

  let proxy = toProxy.get(target)
  if (proxy) return proxy

  if (toRaw.has(target)) return target

  const handlers = {
    get (target, key, receiver) {
      let res = Reflect.get(target, key, receiver)
      if (isObj(target[key])) {
        return reactive(res)
      }
      return res
    },
    set (target, key, value, receiver) {
      if (key in target) {
        trigger()
      }
      return Reflect.set(target, key, value, receiver)
    },
    deleteProperty () {
      return Reflect.defineProperty(target, key)
    }
  }

  let observed = new Proxy(target, handlers)

  toProxy.set(target, observed)
  toRaw.set(observed, target)

  return observed
}
