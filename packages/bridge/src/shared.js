export function canClone(o) {
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

export function wrap(arg) {
  if (canClone(arg)) {
    return [0, arg]
  } else {
    return [1, obj2id(arg)]
  }
}

export function unwrap(arr) {
  switch (arr[0]) {
    case 0: // primitive
      return arr[1]
    case 1: // object
      return id2obj(arr[1])
    case 2: // callback
      return getCb(arr[1])
    case 3: // property
      return id2prop(arr[1], arr[2])
    default:
      throw new Error('invalid arg type')
  }
}
