import { createElement } from './dom'
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
    commitQueue.forEach(commit)
  }
}

function commit (op) {
  el(op[1]).innerHTML = '' // 暂时清除
  elementMap.length = 1
  if (op.length > 3) {
    if (op[2]) {
      el(op[1])[op[0]](el(op[3]), el(op[2]))
    } else {
      el(op[1])[op[0]](createElement(op[3]), null)
    }
  } else {
    el(op[1])[op[0]](el(op[2]))
  }
}

function el (index) {
  return elementMap[index]
}
