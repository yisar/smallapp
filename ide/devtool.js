const { ipcRenderer } = require('electron')

window.initDevTools = function () {
  const tabbedPane = global.UI.inspectorView._tabbedLocation._tabbedPane
  tabbedPane.closeTab('elements')
  tabbedPane.closeTab('timeline')
  tabbedPane.closeTab('resources')

  ipcRenderer.sendToHost('devtools preload load')
}
