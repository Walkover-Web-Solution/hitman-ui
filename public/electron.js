const { app, BrowserWindow } = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')

let mainWindow
let deeplinkUrl
const log = require('electron-log').info
const gotTheLock = app.requestSingleInstanceLock()

// Force Single Instance Application
if (!gotTheLock) {
  app.quit()
} else {
  // Someone tried to run a second instance, we should focus our window.
  app.on('second-instance', (event, commandLine, workingDirectory) => {
  // Protocol handler for win32
  // argv: An array of the second instance’s (command line / deep linked) arguments
    if (process.platform === 'win32') {
    // Keep only command line / deep linked arguments
      if (commandLine) {
        const hitmanProtocolData = commandLine.find(item => item.includes('hitman-app://'))
        if (hitmanProtocolData) {
          deeplinkUrl = hitmanProtocolData
          const token = hitmanProtocolData.split('sokt-auth-token=').pop()
          if (token) {
            log('emitting: ' + token)
            mainWindow.webContents.send('token-transfer-channel', token)
          }
        }
      }
      log(commandLine)
    }

    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

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
  const startURL = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '/index.html')}`

  mainWindow.loadURL(startURL)
  // Protocol handler for win32
  if (process.platform === 'win32') {
    // Keep only command line / deep linked arguments
    deeplinkUrl = process.argv.slice(1)
  }
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
// Protocol handler for osx
app.on('open-url', function (event, url) {
  event.preventDefault()
  deeplinkUrl = url
  log('open-url# ' + deeplinkUrl)
  if (deeplinkUrl) {
    const token = deeplinkUrl.split('sokt-auth-token=').pop()
    if (token) {
      log('emitting: ' + token)
      mainWindow.webContents.send('token-transfer-channel', token)
    }
  }
})
