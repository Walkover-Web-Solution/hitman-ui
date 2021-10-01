const { app, BrowserWindow, ipcMain } = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')
const { makeHttpRequestThroughAxios } = require('./request')
const fs = require('fs')

let mainWindow
let deeplinkUrl
const gotTheLock = app.requestSingleInstanceLock()
const FILE_UPLOAD_DIRECTORY = app.getPath('userData') + '/fileUploads/'
!fs.existsSync(FILE_UPLOAD_DIRECTORY) && fs.mkdirSync(FILE_UPLOAD_DIRECTORY, { recursive: true })

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
            mainWindow.webContents.send('token-transfer-channel', token)
          }
        }
      }
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
      contextIsolation: false,
      enableRemoteModule: true
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

ipcMain.handle('request-channel', (event, arg) => {
  return makeHttpRequestThroughAxios(arg, FILE_UPLOAD_DIRECTORY)
})

// If we are running a non-packaged version of the app && on windows
if (isDev && process.platform === 'win32') {
  // Set the path of electron.exe and your app.
  // These two additional parameters are only available on windows.
  app.setAsDefaultProtocolClient('hitman-app', process.execPath, [path.resolve(process.argv[1])])
} else {
  app.setAsDefaultProtocolClient('hitman-app')
}

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
  if (deeplinkUrl) {
    const token = deeplinkUrl.split('sokt-auth-token=').pop()
    if (token) {
      mainWindow.webContents.send('token-transfer-channel', token)
    }
  }
})
