import { createElement } from './dom'

export function masochism () {
  const PATHNAME = (function () {
    const scripts = document.getElementsByTagName('script')
    return scripts[scripts.length - 1].src
  })()

  const worker = new Worker(PATHNAME)
  worker.onmessage = e => {
    const newVnode = e.data
    document.body.innerHTML = ''
    document.body.appendChild(createElement(newVnode, worker))
  }
}
