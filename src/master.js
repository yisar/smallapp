let patches = {}
let index = 0

export function sadism (config) {
  function perform (e) {
    console.log(e.data)
  }
  self.onmessage = perform
}

function diff (oldVnode, newVnode) {
  if (oldVnode === newVnode) {
  } else if (oldVnode != null && oldVnode.tag === TEXT && newVnode === TEXT) {
    if (oldVnode.type != newVnode.type) {
      patches[index++] = [newVnode]
    }
  } else if (oldVnode == null || oldVnode.type !== newVnode.type) {
    patches[index++] = [newVnode]
    if (oldVnode != null) {
      patches[index++] = [oldVnode, index]
    }
  } else {
  }
  return patches
}
