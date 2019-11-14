import { createElement } from './dom'
const parentMap = []

export function masochism () {
  const PATHNAME = (function () {
    const scripts = document.getElementsByTagName('script')
    return scripts[scripts.length - 1].src
  })()
  parentMap.push(document.body)

  const worker = new Worker(PATHNAME)
  worker.onmessage = e => {
    const commit = e.data
    commit.forEach(op => {
      parentMap[op[1]].innerHTML = '' // 暂时清除
      if (op.length > 3) {
        parentMap[op[1]][op[0]](createElement(op[3], worker), op[2])
      } else {
        parentMap[op[1]][op[0]](op[2])
      }
    })
  }
}
