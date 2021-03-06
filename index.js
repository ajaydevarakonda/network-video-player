const { app, BrowserWindow, dialog } = require('electron')

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
var serverClose;

function createWindow() {
  // TODO: change width to 600, height to 250
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
    mainWindow = null
  })
}

// Finished init
app.on('ready', async function () {
  const ipaddress = getIPAddress();
  var message = '';
  tunnelIp = await ngrok.connect({ addr: port });

  const { close } = server.listen(port, () => {
    message = `Enter http://${ipaddress}:${port}, when app asks.<br/>`;
    if (tunnelIp) {
      message += `Enter ${tunnelIp} if your computer and mobile are on different network.`
    }
  });
  serverClose = close;

  ipc.on('window-loaded', async function (event, data) {
    event.sender.send('backend-msg', message);
  });

  ipc.on('select-folder', async function (event) {
    // show select folder dialogue
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })
    
    if (! canceled && filePaths.length) {
      const folderPath = filePaths[0];
      server.locals.rootDirectory = folderPath;
      event.sender.send('folder-selected', folderPath);
    }
  })

  createWindow();
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})

app.on('before-quit', async function () {
  await ngrok.kill();
  serverClose();
})