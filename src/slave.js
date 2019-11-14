import { createElement } from './dom'
const dom = []

export function masochism () {
  const PATHNAME = (function () {
    const scripts = document.getElementsByTagName('script')
    return scripts[scripts.length - 1].src
  })()
  dom.push(document.body)

  const worker = new Worker(PATHNAME)
  worker.onmessage = e => {
    const commit = e.data
    commit.forEach(op => {
      dom[op[1]].innerHTML = '' // 暂时清除
      if (op.length > 3) {
        dom[op[1]][op[0]](createElement(op[3], worker), op[2])
      } else {
        dom[op[1]][op[0]](dom[op[2]])
      }
    })
  }
}
