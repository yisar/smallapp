export const TEXT = 3
export let handlerMap = {}
const tagMap = new Map([
  ['view', 'div'],
  ['text', 'span'],
  ['icon', 'i'],
  ['button', 'button'],
  ['image', 'img'],
  ['navigator', 'a'],
])

export function h(tag: string | Function, attrs: any) {
  let props = attrs || {}
  let key = props.key || null
  let children = []
  // use undefined tag, need throw error.
  let newTag = tagMap.get(tag as string)
  if (!newTag && typeof tag !== 'function') {
    children.push({ tag: `<${tag}> does not exist，please check your code`, type: TEXT })
    return {
      tag: tag,
      props,
      children,
      key,
    }
  }
  Object.keys(props).forEach((k, i) => {
    if (k[0] === 'o' && k[1] === 'n') {
      let e = props[k]
      handlerMap[i] = e
      props[k] = i
    }
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

  /**
   * component render
   * {
   *  tag: {
   *    tag: xxx,
   *    ...
   *  }
   *  ...
   * }
   * @type {string}
   */
  const tagName = typeof tag === 'function' ? tag(props) : tag
  return tagName.tag ? tagName : {
    tag: tagMap.get(tagName as string) || tagName,
    props,
    children,
    key,
  }
}
