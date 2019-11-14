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
    const commit = e.data
    commit.forEach(op => {
      elementMap[op[1]].innerHTML = '' // 暂时清除
      elementMap.length = 1
      if (op.length > 3) {
        if (op[2]) {
          elementMap[op[1]][op[0]](elementMap[op[3]], elementMap[op[2]])
        } else {
          elementMap[op[1]][op[0]](createElement(op[3]), null)
        }
      } else {
        elementMap[op[1]][op[0]](elementMap[op[2]])
      }
    })
  }
}
