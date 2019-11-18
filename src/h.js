export const TEXT = 3
export let handlerMap = []
const tagMap = new Map([
  ['view', 'div'],
  ['text', 'span'],
  ['icon', 'i'],
  ['button', 'button'],
  ['image', 'img'],
  ['navigator', 'a']
])
const inputMap = ['checkbox', 'radio', 'text']

export function h (tag, attrs) {
  let props = attrs || {}
  let key = props.key || null
  let children = []

  for (const k in props) {
    if (k[0] === 'o' && k[1] === 'n') {
      let e = props[k]
      handlerMap.push(e)
      props[k] = handlerMap.length
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
  
  let newTag = tagMap.get(tag)
  if (newTag) tag === newTag
  let index = inputMap.indexOf(tag) > -1
  if (index) {
    newTag = 'input'
    props.type = tagMap[index]
  }

  return {
    tag: typeof tag === 'function' ? tag(props) : tag,
    props,
    children,
    key
  }
}
