import { createElement, updateProperty } from './dom'
export const elementMap = []
export let worker = null
const isNum = x => typeof x === 'number'

export function masochism () {
  const PATHNAME = (function () {
    const scripts = document.getElementsByTagName('script')
    return scripts[scripts.length - 1].src
  })()
  elementMap.push(document.body)
  worker = new Worker(PATHNAME)

  worker.onmessage = e => {
    const commitQueue = e.data
    for (const index in commitQueue) {
      commit(commitQueue[index])
    }
  }
}

function commit (op) {
  if (op.length === 3) {
    isNum(op[1])
      ? getElement(op[0]).insertBefore(
        getElement(op[2]) || createElement(op[2]),
        getElement(op[1])
      )
      : updateProperty(getElement(op[0]), op[1], op[2])
  } else {
    isNum(op[1])
      ? getElement(op[0]).removeChild(op[1])
      : (getElement(op[0]).nodeValue = op[1])
  }
}

const getElement = index => elementMap[index] || null
