const { app, BrowserWindow, BrowserView, ipcMain, webContents, Menu } = require('electron')

let devtool

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      nodeIntegration: true,
      webviewTag: true,
      plugins: true,
    },
  })

  // Menu.setApplicationMenu(null)

  win.loadFile('./app/index.html')

  devtool = new BrowserView({
    webPreferences: {
      preload: './devtool.js',
    },
  })
  win.setBrowserView(devtool)
  devtool.setBounds({
    x: 0,
    y: 0,
    width: 400,
    height: 300,
  })
}

app.whenReady().then(createWindow)

ipcMain.on('load', (event, { url }) => {
  const container = webContents.getAllWebContents().find((item) => item.getURL().includes(url))
  if (container) {
    container.setDevToolsWebContents(devtool.webContents)
    container.debugger.attach()
    container.openDevTools()
    devtool.webContents.executeJavaScript(`
      window.initDevTools && window.initDevTools();
    `)
  }
})
