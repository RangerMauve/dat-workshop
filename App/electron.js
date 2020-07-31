const { BrowserWindow, app } = require('electron')
const { join } = require('path')

// Wait for electron to be ready for spawning windows
app.on('ready', () => {
  // Make a new web browser window which can access node.js APIs
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      webviewTag: false
    }
  })

  // Load the UI page into the browser
  win.loadFile(join(__dirname, 'electron.html'))
})
