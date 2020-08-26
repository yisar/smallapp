importScripts('../src/master.js')

effect((context) => {
  const document = context.document
  const customElements = context.customElements

  const tag = document.createElement('voe-component')
  document.body.appendChild(tag)
  const shadow = document.define(
    'voe-component',
    () => console.log('mount'),
    () => console.log('unmount')
  )
  const h1 = document.createElement('h1')
  h1.textContent = 'hello Voe component'
  shadow.appendChild(h1)
})
