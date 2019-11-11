export const TEXT = 3

export function h (tag, attrs) {
  let props = attrs || {}
  let key = props.key || null
  let children = []

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
