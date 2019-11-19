export const TEXT = 3
export let handlerMap = {}
const tagMap = new Map([
  ['view', 'div'],
  ['text', 'span'],
  ['icon', 'i'],
  ['button', 'button'],
  ['image', 'img'],
  ['navigator', 'a']
])
const inputMap = ['checkbox', 'radio']

export function h (tag, attrs) {
  let props = attrs || {}
  let key = props.key || null
  let children = []

  Object.keys(props).forEach((k, i) => {
    let e = props[k]
    handlerMap[i] = e
    props[k] = i
  })

  for (let i = 2; i < arguments.length; i++) {
    let vnode = arguments[i]
    if (vnode == null || vnode === true || vnode === false) {
    } else if (typeof vnode === 'string' || typeof vnode === 'number') {
      children.push({ tag: vnode + '', type: TEXT })
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
