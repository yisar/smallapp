import { TEXT } from './h'
export const EVENT = 1

export function updateProperty (dom, name, oldValue, newValue, worker) {
  if (name === 'key') {
  } else if (name[0] === 'o' && name[1] === 'n') {
    console.log(oldValue)
    name = name.slice(2).toLowerCase()
    let newHandler = (event) => {
      // 不能传太多，此处省略对事件的简化操作
      worker.postMessage({
        type: EVENT,
        id: newValue
      })
    }
    dom.addEventListener(name, newHandler)
  }
}

export function createElement (vnode, worker) {
  let dom = vnode.type === TEXT ? document.createTextNode(vnode.tag) : document.createElement(vnode.tag)
  if (vnode.children) {
    for (let i = 0; i < vnode.children.length; i++) {
      dom.appendChild(createElement(vnode.children[i]))
    }
  }
  for (var name in vnode.props) {
    updateProperty(dom, name, null, vnode.props[name], worker)
  }
  return dom
}
