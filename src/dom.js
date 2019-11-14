import { TEXT } from './h'
import { worker, elementMap } from './slave'
export const EVENT = 1

export function updateProperty (dom, name, oldValue, newValue) {
  if (name === 'key') {
  } else if (name[0] === 'o' && name[1] === 'n') {
    name = name.slice(2).toLowerCase()
    let newHandler = event => {
      // 不能传太多，此处省略对事件的简化操作
      worker.postMessage({
        type: EVENT,
        id: newValue
      })
    }
    dom.addEventListener(name, newHandler)
  }
}

export function createElement (vnode) {
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
