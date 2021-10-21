const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')
const log = require('electron-log')
const { makeHttpRequestThroughAxios, invokeCancel } = require('./request')
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
    if (isDev) log.info('Event: Second-instance', { commandLine, workingDirectory })
    // Protocol handler for win32 & linux
    // argv: An array of the second instance’s (command line / deep linked) arguments
    if (process.platform === 'win32' || process.platform === 'linux') {
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

  /** For Dev */
  if (isDev) mainWindow.webContents.openDevTools()

  mainWindow.webContents.on('before-input-event', (event, input) => {
    const CommandOrControl = (process.platform === 'darwin') ? input.meta : input.control

    if (input.type === 'keyDown' && input.isAutoRepeat === false) {
      if (isDev) log.info('Intercept Before Input Event', input)
      /** Trigger Endpoint: CTRL+E or CMD+E */
      if (CommandOrControl && input.key.toLowerCase() === 'enter') {
        mainWindow.webContents.send('ENDPOINT_SHORTCUTS_CHANNEL', 'TRIGGER_ENDPOINT')
        event.preventDefault()
      }

      /** Endpoint Save As: CTRL+SHIFT+S or CMD+SHIF+S */
      if (CommandOrControl && input.shift && input.key.toLowerCase() === 's') {
        mainWindow.webContents.send('ENDPOINT_SHORTCUTS_CHANNEL', 'SAVE_AS')
        event.preventDefault()
      }

      /** Endpoint Save: CTRL+S or CMD+S */
      if (CommandOrControl && !input.shift && input.key.toLowerCase() === 's') {
        mainWindow.webContents.send('ENDPOINT_SHORTCUTS_CHANNEL', 'SAVE')
        event.preventDefault()
      }

      /** Rename Endpoint: CTRL+E or CMD+E */
      if (CommandOrControl && input.key.toLowerCase() === 'e') {
        mainWindow.webContents.send('ENDPOINT_SHORTCUTS_CHANNEL', 'RENAME_ENDPOINT')
        event.preventDefault()
      }

      /** Open Tab At Index: CTRL+[1-9] or CMD+[1-9] */
      if (CommandOrControl && ['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(input.key)) {
        mainWindow.webContents.send('TAB_SHORTCUTS_CHANNEL', { type: 'OPEN_TAB_AT_INDEX', payload: input.key })
        event.preventDefault()
      }

      /** Close current tab: Ctrl+w */
      if (CommandOrControl && input.key.toLowerCase() === 'w') {
        mainWindow.webContents.send('TAB_SHORTCUTS_CHANNEL', { type: 'CLOSE_CURRENT_TAB' })
        event.preventDefault()
      }

      /** New Tab */
      if (CommandOrControl && input.key.toLowerCase() === 't') {
        mainWindow.webContents.send('TAB_SHORTCUTS_CHANNEL', { type: 'OPEN_NEW_TAB' })
        event.preventDefault()
      }

      /** Switch between tabs: Ctrl+tab (for mac Command+tab) */
      if (CommandOrControl && input.key.toLowerCase() === 'tab') {
        mainWindow.webContents.send('TAB_SHORTCUTS_CHANNEL', { type: 'SWITCH_NEXT_TAB' })
        event.preventDefault()
      }

      /** Focus Search: CTRL+F or CMD+F */
      if (CommandOrControl && input.key.toLowerCase() === 'f') {
        event.preventDefault()
        mainWindow.webContents.send('SIDEBAR_SHORTCUTS_CHANNEL', 'FOCUS_SEARCH')
      }

      /** TO DO: Handle Below Sidebar Shortcut Events in React */

      /** Navigate down an Item in sidebar: DOWN */
      if (input.key.toLowerCase() === 'arrowdown') {
        event.preventDefault()
        mainWindow.webContents.send('SIDEBAR_SHORTCUTS_CHANNEL', 'DOWN_NAVIGATION')
      }

      /** Navigate up an Item in sidebar: UP */
      if (input.key.toLowerCase() === 'arrowup') {
        event.preventDefault()
        mainWindow.webContents.send('SIDEBAR_SHORTCUTS_CHANNEL', 'UP_NAVIGATION')
      }

      /** Open Item from sidebar: RIGHT */
      if (input.key.toLowerCase() === 'arrowright') {
        mainWindow.webContents.send('SIDEBAR_SHORTCUTS_CHANNEL', 'OPEN_ENTITY')
        event.preventDefault()
      }

      /** Close the opened Item from Sidebar: CTRL+LEFT or CMD+LEFT */
      if (CommandOrControl && input.key.toLowerCase() === 'arrowleft') {
        mainWindow.webContents.send('SIDEBAR_SHORTCUTS_CHANNEL', 'CLOSE_ENTITY')
        event.preventDefault()
      }

      /** Duplicate the titem from sidebar: CTRL+D or CMD+D */
      if (CommandOrControl && input.key.toLowerCase() === 'd') {
        mainWindow.webContents.send('SIDEBAR_SHORTCUTS_CHANNEL', 'DUPLICATE_ENTITY')
        event.preventDefault()
      }

      /** Delete Item from Sidebar: DEL */
      if (input.key.toLowerCase() === 'delete') {
        mainWindow.webContents.send('SIDEBAR_SHORTCUTS_CHANNEL', 'DELETE_ENTITY')
        event.preventDefault()
      }
    }
  })

  mainWindow.once('ready-to-show', () => mainWindow.show())
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

ipcMain.handle('request-channel', (event, arg) => {
  return makeHttpRequestThroughAxios(arg, FILE_UPLOAD_DIRECTORY)
})

ipcMain.handle('request-cancel', (event, arg) => {
  return invokeCancel(arg)
})

// // If we are running a non-packaged version of the app && on windows
if (isDev && process.platform === 'win32') {
  // Set the path of electron.exe and your app.
  // These two additional parameters are only available on windows.
  app.setAsDefaultProtocolClient('hitman-app', process.execPath, [path.resolve(process.argv[1])])
} else {
  app.setAsDefaultProtocolClient('hitman-app')
}

/** Disable Menu */
Menu.setApplicationMenu(null)

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
  if (isDev) log.info('Event: open-url', url)
  if (deeplinkUrl) {
    const token = deeplinkUrl.split('sokt-auth-token=').pop()
    if (token) {
      mainWindow.webContents.send('token-transfer-channel', token)
    }
  }
})
