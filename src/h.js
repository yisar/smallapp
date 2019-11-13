export const TEXT = 3

export let handlers = []

export function h (tag, attrs) {
  let props = attrs || {}
  let key = props.key || null
  let children = []

  for (const k in props) {
    if (k[0] === 'o' && k[1] === 'n') {
      let e = props[k]
      handlers.push(e)
      props[k] = handlers.length
    }
  }

  for (let i = 2; i < arguments.length; i++) {
    let vnode = arguments[i]
    if (vnode == null || vnode === true || vnode === false) {
    } else if (typeof vnode === 'string' || typeof vnode === 'number') {
      children.push({ tag: vnode, type: TEXT })
    } else {
      children.push(vnode)
    }
  }

  delete props.key
  return { tag, props, children, key }
}