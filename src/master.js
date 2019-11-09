const [TEXT, INSERT, REMOVE, UPDATE] = [0, 1, 2, 3]
let patches = []

export function diff (oldVnode, newVnode) {
  if (oldVnode === newVnode) {
  } else if (oldVnode && isText(oldVnode.type) && isText(newVnode.type)) {
    if (oldVnode.children !== newVnode.children) {
      patches.push({ type: TEXT, newVnode, oldVnode })
    }
  } else if (oldVnode == null || oldVnode.type !== newVnode.type) {
    patches.push({ type: INSERT, newVnode })
    if (oldVnode != null) {
      patches.push({ type: REMOVE, oldVnode })
    }
  } else {
    patches.push({ type: UPDATE,oldVnode,newVnode })

    let savedVnode
    let childVnode

    let oldKey
    let oldKids = oldVnode.children
    let oldStart = 0
    let oldEnd = oldKids.length - 1

    let newKey
    let newKids = newVnode.children
    let newStart = 0
    let newEnd = newKids.length - 1

    while (newStart <= newEnd && oldStart <= oldEnd) {
      oldKey = getKey(oldKids[oldStart])
      newKey = getKey(newKids[newStart])

      if (oldKey == null || oldKey !== newKey) break

      diff(oldKids[oldStart], newKids[newStart])

      oldStart++
      newStart++
    }

    while (newStart <= newEnd && oldStart <= oldEnd) {
      oldKey = getKey(oldKids[oldStart])
      newKey = getKey(newKids[newStart])

      if (oldKey == null || oldKey !== newKey) break

      diff(oldKids[oldStart], newKids[newStart])

      oldStart--
      newStart--
    }

    if (oldStart > oldEnd) {
      while (newStart <= newEnd) {
        patches.push({ type: INSERT, before: newKids[newStart++], after: oldKids[oldStart] })
      }
    } else if (newStart > newEnd) {
      while (oldStart <= oldEnd) {
        patches.push({ type: REMOVE, node: oldKids[oldStart++] })
      }
    } else {
      let oldKeyed = createKeyMap(oldKids, oldStart, newStart)
      let newKeyed = {}

      while (newStart <= newEnd) {
        oldKey = getKey((childVnode = oldKids[oldStart]))
        newKey = getKey(newKids[newStart])

        if (newKeyed[oldKey] || (oldKey != null && newKey === getKey(oldKids[oldStart + 1]))) {
          if (oldKey == null) {
            patches.push({ type: REMOVE, childVnode })
          }
          oldStart++
          continue
        }

        if (newKey == null) {
          if (oldKey == null) {
            diff(childVnode, newKids[newStart])
            newStart++
          }
          oldStart++
        } else {
          if (oldKey === newKey) {
            diff(childVnode, newKids[newStart])
            newKeyed[newKey] = true
            oldStart++
          } else {
            if ((savedVnode = oldKeyed[newKeyed]) != null) {
              diff(savedVnode, newKids[newStart])
              newKeyed[newKey] = true
            } else {
              diff(null, newKids[newStart])
            }
          }
          newStart++
        }
      }

      while (oldStart <= oldEnd) {
        if (getKey((childVnode = oldKids[oldStart++])) == null) {
          patches.push({ type: REMOVE, node: childVnode })
        }
      }

      for (const key in oldKeyed) {
        if (newKeyed[key] == null) {
          patches.push({ type: REMOVE, node: lastkeyed[key] })
        }
      }
    }
  }
  console.log(patches)
}

function getKey (node) {
  return node == null ? null : node.key
}

function isText(node){
  return typeof node.type === 'string' || typeof node.type === 'number'
}

function createKeyMap (children, start, end) {
  let out = {}
  let key
  let node

  while (start <= end) {
    if ((key = (node = children[start]).key) != null) {
      out[key] = node
    }
    start++
  }
  return out
}
