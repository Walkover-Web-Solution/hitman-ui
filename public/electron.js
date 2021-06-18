const { app, BrowserWindow, protocol } = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  protocol.registerFileProtocol('hitman-app', (request, callback) => {
    // parse authorization code from request
    console.log(request)
  }, (error) => {
    if (error) console.error('Failed to register protocol')
  })
  const startURL = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '/index.html')}`

  mainWindow.loadURL(startURL)

  mainWindow.once('ready-to-show', () => mainWindow.show())
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}
app.setAsDefaultProtocolClient('hitman-app')
app.on('ready', createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
