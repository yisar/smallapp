import { wrap, unwrap } from './shared'

self.slave = {}
const idMap = new Map([[0, self]])
let nextid = -1

export function connect(worker) {
  worker.onmessage = (e) => slave.onmessage(e.data)
  slave.postMessage = (data) => worker.postMessage(data)
  worker.postMessage('start')
}

function id2obj(id) {
  const ret = idMap.get(id)
  if (!ret) throw new Error('missing object id: ' + id)
  return ret
}

function obj2id(object) {
  const id = nextid--
  idMap.set(id, object)
  return id
}

function id2prop(id, path) {
  const ret = idMap.get(id)
  if (!ret) throw new Error('missing object id: ' + id)
  let base = ret
  for (let i = 0, len = path.length; i < len; ++i) base = base[path[i]]
  return base
}

function getCb(id) {
  return (...args) =>
    slave.postMessage({
      type: 'callback',
      id: id,
      args: args.map(wrap),
    })
}

slave.onmessage = function (data) {
  switch (data.type) {
    case 'cmds':
      command(data)
      break
    case 'cleanup':
      cleanup(data)
      break
    default:
      console.error('Unknown message type: ' + data.type)
      break
  }
}

function command(data) {
  const res = []
  for (const cmd of data.cmds) {
    RunCommand(cmd, res)
  }

  slave.postMessage({
    type: 'done',
    flushId: data.flushId,
    res,
  })
}

function RunCommand(arr, res) {
  const type = arr[0]
  switch (type) {
    case 0: // call
      call(arr[1], arr[2], arr[3], arr[4])
      break
    case 1: // set
      set(arr[1], arr[2], arr[3])
      break
    case 2: // get
      get(arr[1], arr[2], arr[3], res)
      break
    case 3: // constructor
      construct(arr[1], arr[2], arr[3], arr[4])
      break
    default:
      throw new Error('invalid cmd type: ' + type)
  }
}

function call(id, path, args, returnid) {
  const obj = id2obj(id)
  const args = args.map(unwrap)
  const name = path[path.length - 1]
  let base = obj
  for (let i = 0, len = path.length - 1; i < len; ++i) {
    base = base[path[i]]
  }
  const ret = base[name](...args)
  idMap.set(returnid, ret)
}

function construct(id, path, args, returnid) {
  const obj = id2obj(id)
  const args = args.map(unwrap)
  const name = path[path.length - 1]
  let base = obj
  for (let i = 0, len = path.length - 1; i < len; ++i) {
    base = base[path[i]]
  }
  const ret = new base[name](...args)
  idMap.set(returnid, ret)
}

function set(id, path, valueData) {
  const obj = id2obj(id)
  const value = unwrap(valueData)
  const name = path[path.length - 1]
  let base = obj
  for (let i = 0, len = path.length - 1; i < len; ++i) {
    base = base[path[i]]
  }
  base[name] = value
}

function get(getId, id, path, res) {
  const obj = id2obj(id)
  if (path === null) {
    res.push([getId, wrap(obj)])
    return
  }
  const name = path[path.length - 1]
  let base = obj
  for (let i = 0, len = path.length - 1; i < len; ++i) {
    base = base[path[i]]
  }
  const value = base[name]
  res.push([getId, wrap(value)])
}

function cleanup(data) {
  for (const id of data.ids) idMap.delete(id)
}
