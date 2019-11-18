import { TEXT } from './h'
import { worker, elementMap } from './slave'
export const EVENT = 1

export function updateProperty (dom, name, oldValue, newValue) {
  if (name === 'key' || oldValue === newValue) {
  } else if (name === 'style') {
    for (var k in {...oldValue, ...newValue}) {
      oldValue = newValue == null || newValue[k] == null ? '' : newValue[k]
      dom[name][k] = oldValue
    }
  } else if (name[0] === 'o' && name[1] === 'n') {
    name = name.slice(2).toLowerCase()
    let newHandler = event => {
      const {
        type,
        x,
        y,
        clientX,
        clientY,
        offsetX,
        offsetY,
        pageX,
        pageY
      } = event
      worker.postMessage({
        type: EVENT,
        id: newValue,
        event: {
          type,
          x,
          y,
          clientX,
          clientY,
          offsetX,
          offsetY,
          pageX,
          pageY
        }
      })
    }
    dom.addEventListener(name, newHandler)
  } else if (name in dom) {
    dom[name] = newValue == null ? '' : newValue
  } else if (newValue == null || newValue === false) {
    dom.removeAttribute(name)
  } else {
    dom.setAttribute(name, newValue)
  }
}

export function createElement (vnode) {
  switch (vnode.tag) {
    case 'view':
      vnode.tag = 'div'
      break
    case 'text':
      vnode.tag = 'span'
      break
  }
  let dom =
    vnode.type === TEXT
      ? document.createTextNode(vnode.tag)
      : document.createElement(vnode.tag)
  elementMap.push(dom)
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
