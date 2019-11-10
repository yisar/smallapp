import { TEXT } from './h'
export let handlers = []

export function updateProperty (dom, name, oldValue, newValue) {
  if (name === 'key') {
  } else if (name[0] === 'o' && name[1] === 'n') {
    name = name.slice(2).toLowerCase()
    if (oldValue) dom.removeEventListener(name, oldValue)
    dom.addEventListener(name, newValue)
    dom.setAttribute(`data-${name}`,handlers.length)
    handlers.push(newValue)
  }
}

export function createElement (vnode) {
  let dom = vnode.tag === TEXT ? document.createTextNode(vnode.type) : document.createElement(vnode.type)
  if (vnode.children) {
    for (let i = 0; i < vnode.children.length; i++) {
      dom.appendChild(createElement(vnode.children[i]))
    }
  }
  for (var name in vnode.props) {
    updateProperty(dom, name, null, vnode.props[name])
  }
  return dom
}
