import { TEXT } from './h'

export function masochism (worker, config) {
  worker.postMessage(0)
  function patch (e) {
    let patches = e.data
    if (patches[0].length === 1) {
      let dom = createElement(patches[0][0])
      document.body.appendChild(dom)
    }
  }
  worker.onmessage = patch
}

function createElement (vnode) {
  let dom = vnode.tag === TEXT ? document.createTextNode(vnode.type) : document.createElement(vnode.type)
  if (vnode.children) {
    for (let i = 0; i < vnode.children.length; i++) {
      dom.appendChild(createElement(vnode.children[i]))
    }
  }
  return dom
}
