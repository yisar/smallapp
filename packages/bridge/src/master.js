if (!self.master) self.master = {}

const getRes = new Map()
const flushRes = new Map()
const queue = []
let dirty = false
let flushid = 0

let callbackid = 0
let returnid = 1
const callbackToId = new Map()
const idToCallback = new Map()

master.targetSymbol = Symbol('target')
master.objectSymbol = Symbol('object')

master.getReturnId = () => {
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

master.enqueue = function (d) {
  queue.push(d)
  if (!dirty) {
    dirty = true
    Promise.resolve().then(master.flush)
  }
}

master.onmessage = function (data) {
  switch (data.type) {
    case 'done':
      done(data)
      break
    case 'callback':
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
    resolve(master.unwrap(valueData))
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
  const args = data.args.map(master.unwrap)
  fn(...args)
}

master.unwrap = function (arr) {
  switch (arr[0]) {
    case 0:
      return arr[1]
    case 1:
      return master.makeObj(arr[1])
    default:
      throw new Error('invalid arg type')
  }
}

master.flush = function () {
  dirty = false
  if (!queue.length) return Promise.resolve()
  const flushId = flushid++

  master.postMessage({
    type: 'cmds',
    cmds: queue,
    flushId: flushId,
  })

  queue.length = 0
  return new Promise((resolve) => {
    flushRes.set(flushId, resolve)
  })
}

master.wrap = function (arg) {
  if (typeof arg === 'function') {
    const objectId = arg[master.objectSymbol]
    if (typeof objectId === 'number') return [1, objectId]
    const target = arg[master.targetSymbol]
    if (target) {
      return [3, target.id, target.path]
    }
    return [2, getCid(arg)]
  } else if (canClone(arg)) {
    return [0, arg]
  } else throw new Error('invalid argument')
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
    if (property === master.objectSymbol) return target.id
    return master.makeProp(target.id, [property])
  },
  set(target, property, value) {
    master.enqueue([1, target.id, [property], master.wrap(value)])
    return true
  },
}

const propHandler = {
  get(target, property) {
    if (property === master.targetSymbol) return target
    
    const cache = target.cache
    const existing = cache.get(property)
    if (existing) return existing
    const path = target.path.slice(0)
    path.push(property)
    const ret = master.makeProp(target.id, path)
    cache.set(property, ret)
    return ret
  },

  set(target, property, value) {
    const path = target.path.slice(0)
    path.push(property)
    master.enqueue([1, target.id, path, master.wrap(value)])
    return true
  },

  apply(target, thisArg, args) {
    const returnid = master.getReturnId()
    master.enqueue([0, target.id, target.path, args.map(master.wrap), returnid])
    return master.makeObj(returnid)
  },

  construct(target, args) {
    const returnid = master.getReturnId()
    master.enqueue([3, target.id, target.path, args.map(master.wrap), returnid])
    return master.makeObj(returnid)
  },
}

master.makeObj = function (id) {
  const fn = function () {}
  fn.id = id
  return new Proxy(fn, objHandler)
}

master.makeProp = function (id, path) {
  const fn = function () {}
  fn.id = id
  fn.path = path
  fn.cache = new Map()
  return new Proxy(fn, propHandler)
}

self.context = master.makeObj(0)
