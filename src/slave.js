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
    commit.forEach(c => {
      parentMap[c[1]].innerHTML = ''
      parentMap[c[1]][c[0]](createElement(c[3], worker), c[2])
    })
  }
}
