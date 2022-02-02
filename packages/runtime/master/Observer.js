const isArray = Array.isArray

export class JsonProxy {
  constructor (root) {
    this.root = root
    this.cache = null
  }
  unlock () {
    this.cb = patch => {
      this.patches.push(patch)
    }
  }
  lock () {
    this.cb = () => {}
  }
  walk (root, path) {
    for (let key in root) {
      if (key in root) {
        if (typeof root[key] === 'object') {
          let disPath = path + '/' + key
          root[key] = this.createPath(root[key], disPath)
          this.walk(root[key], disPath)
        }
      }
    }
    return this.createPath(root, '')
  }
  proxify (root) {
    this.lock()
    let res = this.walk(root, '')
    this.unlock()
    return res
  }
  getState () {
    this.patches = []
    return (this.cache = this.proxify(this.root))
  }
  getPatches () {
    return this.patches.splice(0, this.patches.length)
  }
  createPath (obj, path) {
    if (!obj) return
    let instance = this
    return new Proxy(obj, {
      get (target, key, receiver) {
        if (key === 'isProxified') return true
        return Reflect.get(target, key, receiver)
      },
      set (target, key, receiver) {
        let disPath = path + '/' + key
        if (
          receiver &&
          typeof receiver === 'object' &&
          receiver.isProxified !== true
        ) {
          receiver = instance.proxifyObjectTree(receiver, disPath)
        }
        if (typeof receiver === 'undefined') {
          if (key in target) {
            if (isArray(target)) {
              instance.cb({ op: 'replace', path: disPath, value: null })
            } else {
              instance.cb({ op: 'remove', path: disPath })
            }
          } else if (!isArray(target)) {
            return Reflect.set(target, key, receiver)
          }
        }
        if (isArray(target) && !Number.isInteger(+key)) {
          return Reflect.set(target, key, receiver)
        }

        if (key in target) {
          if (typeof target[key] === 'undefined') {
            if (isArray(target)) {
              instance.cb({ op: 'replace', path: disPath, value: receiver })
            } else {
              instance.cb({ op: 'add', path: disPath, value: receiver })
            }
            return Reflect.set(target, key, receiver)
          } else {
            instance.cb({ op: 'replace', path: disPath, value: receiver })
            return Reflect.set(target, key, receiver)
          }
        } else {
          instance.cb({ op: 'add', path: disPath, value: receiver })
          return Reflect.set(target, key, receiver)
        }
      },
      deleteProperty (target, key) {
        if (typeof target[key] !== undefined) {
          instance.cb({ op: 'remove', path: path + '/' + key })
        }
        return Reflect.deleteProperty(target, key)
      }
    })
  }
}

export function getPlain(path, source) {
    let i = 0
    while (i < path.length) {
      source = source[path[i++]]
    }
    return source
  }
  
  export function setPlain(path, value, source) {
    let target = {}
    if (path.length) {
      target[path[0]] =
        path.length > 1 ? setPlain(path.slice(1), value, source[path[0]]) : value
      return { ...source, ...target }
    }
    return { ...source, ...value }
  }