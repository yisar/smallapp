export function sadism (config) {
  function perform (e) {
    const setup = config.setup
    let rootVnode = setup()
    let patches = diff(null, rootVnode)
    self.postMessage(JSON.stringify(patches))
  }
  self.onmessage = perform
}

let patches = {}
let index = 0

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
