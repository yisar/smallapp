const getRes = new Map()
const flushRes = new Map()
const queue = []
let dirty = false
let flushid = 0

let callbackid = 0
let returnid = 1
const callbackToId = new Map()
const idToCallback = new Map()

const targetSymbol = Symbol('target')
const objectSymbol = Symbol('object')

const getReturnId = () => {
  return returnid++
}

function canClone(o) {
  const t = typeof o
  return (
    t === 'undefined' ||
    o === null ||
    t === 'boolean' ||
    t === 'number' ||
    t === 'string' ||
    o instanceof Blob ||
    o instanceof ArrayBuffer ||
    o instanceof ImageData
  )
}

const enqueue = function (d) {
  queue.push(d)
  if (!dirty) {
    dirty = true
    Promise.resolve().then(flush)
  }
}

const onmessage = function (data) {
  switch (data.type) {
    case 'done':
      done(data)
      break
    case 'cb':
      callback(data)
      break
    default:
      throw new Error('invalid message type: ' + data.type)
  }
}

function done(data) {
  for (const [getId, valueData] of data.res) {
    const resolve = getRes.get(getId)
    if (!resolve) throw new Error('invalid get id')
    getRes.delete(getId)
    resolve(unwrap(valueData))
  }
  const flushId = data.flushId
  const flushResolve = flushRes.get(flushId)
  if (!flushResolve) throw new Error('invalid flush id')

  flushRes.delete(flushId)
  flushResolve()
}

function callback(data) {
  const fn = idToCallback.get(data.id)
  if (!fn) throw new Error('invalid callback id')
  const args = data.args.map(unwrap)
  fn(...args)
}

const unwrap = function (arr) {
  switch (arr[0]) {
    case 0:
      return arr[1]
    case 1:
      return makeObj(arr[1])
    default:
      throw new Error('invalid arg type')
  }
}

const flush = function () {
  dirty = false
  if (!queue.length) return Promise.resolve()
  const flushId = flushid++

  postMessage({
    type: 'cmds',
    cmds: queue,
    flushId: flushId,
  })

  queue.length = 0
  return new Promise((resolve) => {
    flushRes.set(flushId, resolve)
  })
}

const wrap = function (arg) {
  if (typeof arg === 'function') {
    const objectId = arg[objectSymbol]
    if (typeof objectId === 'number') return [1, objectId]
    const target = arg[targetSymbol]
    if (target) {
      return [3, target.id, target.path]
    }
    return [2, getCid(arg)]
  } else if (canClone(arg)) {
    return [0, arg]
  } else {
    throw new Error('invalid argument')
  }
}

function getCid(fn) {
  let id = callbackToId.get(fn)
  if (typeof id === 'undefined') {
    id = callbackid++
    callbackToId.set(fn, id)
    idToCallback.set(id, fn)
  }
  return id
}

const objHandler = {
  get(target, property) {
    if (property === objectSymbol) return target.id
    return makeProp(target.id, [property])
  },
  set(target, property, value) {
    enqueue([1, target.id, [property], wrap(value)])
    return true
  }
}

const propHandler = {
  get(target, property) {
    if (property === targetSymbol) return target
    const cache = target.cache
    const c = cache.get(property)
    if (c) return c
    const path = target.path.slice(0)
    path.push(property)
    const ret = makeProp(target.id, path)
    cache.set(property, ret)
    return ret
  },

  set(target, property, value) {
    const path = target.path.slice(0)
    path.push(property)
    enqueue([1, target.id, path, wrap(value)])
    return true
  },

  apply(target, thisArg, args) {
    const returnid = getReturnId()
    enqueue([0, target.id, target.path, args.map(wrap), returnid])
    return makeObj(returnid)
  },

  construct(target, args) {
    const returnid = getReturnId()
    enqueue([2, target.id, target.path, args.map(wrap), returnid])
    return makeObj(returnid)
  }
}

const makeObj = function (id) {
  const fn = function () {}
  fn.id = id
  return new Proxy(fn, objHandler)
}

const makeProp = function (id, path) {
  const fn = function () {}
  fn.id = id
  fn.path = path
  fn.cache = new Map()
  return new Proxy(fn, propHandler)
}

const postMessage = (data) => self.postMessage(data)

self.addEventListener('message', (e) => {
  if (e.data === 'start') {
    console.log('start')
  } else {
    onmessage(e.data)
  }
})

export default makeObj(0)
