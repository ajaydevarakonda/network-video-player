// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const ngrok = require("ngrok");
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });
var ipc = require('electron').ipcMain;

const { getIPAddress, exec } = require('./lib/utils');
const server = require('./src/server');

// ================================= GLOBALS =============================================
const port = 3333;
var mainWindow;
var tunnelIp;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 600,
    height: 250,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })

  mainWindow.loadFile('index.html')
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async function () {
  const ipaddress = getIPAddress();
  var message = '';
  tunnelIp = await ngrok.connect({ addr: port });

  server.listen(port, () => {
    message = `Enter http://${ipaddress}:${port}, when app asks.<br/>`;
    if (tunnelIp) {      
      message += `Enter ${tunnelIp} if your computer and mobile are on different network.`
    }
  });

  ipc.once('window-loaded', async function(event, data) {
    event.sender.send('backend-msg', message);
  });
  createWindow();
})



// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

app.on('before-quit', async function() {
  await ngrok.kill();
})