import { createElement, updateProperty } from './dom'
export const elementMap = []
export let worker = null

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
  if (op.length === 4) {
    // updateProperty(op[1], op[2], op[3])
  } else if (op.length === 3) {
    getElement(op[0]).insertBefore(
      getElement(op[2]) || createElement(op[2]),
      getElement(op[1])
    )
  } else {
    getElement(op[0]).nodeValue = op[1]
  }
}

const getElement = index => elementMap[index] || null
