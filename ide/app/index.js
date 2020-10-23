import { render, h, useEffect } from 'fre'
const { ipcRenderer } = require('electron')

function App() {
  useEffect(() => {
    const webview = document.querySelector('webview')
    const loadstop = () => {
      ipcRenderer.send('load', {
        url: 'https://www.baidu.com/',
      })
    }

    webview.addEventListener('did-stop-loading', loadstop)
  }, [])
  return <webview id='simulation' src='https://www.baidu.com/'></webview>
}

render(<App />, document.getElementById('root'))
