self.addEventListener('message', (e) => {
  if (e.data === 'start') {
    importScripts('../src/master.js')
    master.postMessage = (data) => self.postMessage(data)
    start()
  } else {
    master.onmessage(e.data)
  }
})

async function start() {
  const document = context.document
  const customElements = context.customElements

  const tag = document.createElement('voe-component')
  document.body.appendChild(tag)
  const shadow = customElements.define('voe-component', context.VoeElement)
  const h1 = document.createElement('h1')
  h1.textContent = 'hello Voe component'
  shadow.appendChild(h1)
}