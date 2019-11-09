const [TEXT, UPDATE, INSERT, REMOVE] = [1, 2,3,4]
let patches = []
let index = 0

function diff (oldVnode, newVnode) {
  if (oldVnode === newVnode) {
  } else if (oldVnode && oldVnode.type === TEXT && newVnode.type === TEXT) {
    if (oldVnode.children !== newVnode.children) {
      patches.push({ type: TEXT, newVnode, oldVnode }) 
    }
  } else if (oldVnode == null || oldVnode.type !== newVnode.type) {
    patches.push({ type: INSERT, newVnode},{ type: REMOVE, oldVnode})
  } else {
    patches.push({type:UPDATE})

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
}

function getKey(node) {
  return node == null ? null : node.key
}

function createKeyMap(children, start, end) {
  let out = {}
  let key
  let node

  for (; start <= end; start++) {
    if ((key = (node = children[start]).key) != null) {
      out[key] = node
    }
  }

  return out
}
