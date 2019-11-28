import { TEXT } from './h'
import { worker, elementMap } from './slave'
import { EVENT } from './master'

export function updateElement(dom, oldProps, newProps) {
  Object.keys(newProps)
    .filter((o, n) => k => o[k] !== n[k])
    .forEach(name => {
      updateProperty(dom, name, oldProps[name], newProps[name], false)
    })
}

export function updateProperty(
  dom: any,
  name: string,
  oldValue: any,
  newValue: any,
  isSvg: boolean
) {
  if (name === 'key' || oldValue === newValue) {
  } else if (name === 'style') {
    for (var k in { ...oldValue, ...newValue }) {
      oldValue = newValue == null || newValue[k] == null ? '' : newValue[k]
      dom[name][k] = oldValue
    }
  } else if (name[0] === 'o' && name[1] === 'n') {
    name = name.slice(2).toLowerCase()
    let newHandler = e => {
      worker.postMessage(
        JSON.stringify({
          type: EVENT,
          id: newValue,
          data: {
            type: e.type,
            x: e.x,
            y: e.y,
            clientX: e.clientX,
            clientY: e.clientY,
            offsetX: e.offsetX,
            offsetY: e.offsetY,
            pageX: e.pageX,
            pageY: e.pageY
          }
        })
      )
    }
    dom.addEventListener(name, newHandler)
  } else if (name in dom && !isSvg) {
    dom[name] = newValue == null ? '' : newValue
  } else if (newValue == null || newValue === false) {
    // dom.removeAttribute(name)
  } else {
    dom.setAttribute(name, newValue)
  }
}

export function createElement(vnode) {
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
    updateProperty(dom, name, null, vnode.props[name], false)
  }
  return dom
}
