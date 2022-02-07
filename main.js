// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('path')
const {download} = require('electron-dl')
const ipc = require('electron').ipcMain;

var AutoLaunch = require('auto-launch');

var mainWindowId = null;


function autoStart(){
  var AutoLauncher = new AutoLaunch({
    name: 'Minersupp',
    path: path.join(__dirname, 'minerapp'),
  });
  
  console.log(AutoLauncher.isEnabled())
  AutoLauncher.enable()
  console.log(AutoLauncher.isEnabled())

  if (AutoLauncher.isEnabled()) {
    AutoLauncher.disable()
    console.log('disabled')
  }else{
    AutoLauncher.enable()
    console.log('enabled')
  }
}


// --------------------------------------------------------------------
function createConfigurationWindow(ownerWindow){
  const configuration_window = new BrowserWindow({
      // parent: top, 
      // modal: true,
      width: 450,
      height: 400,
      parent: ownerWindow, 
      modal: true,
      width: 850,
      height: 500,
      resizable: false,
      // minimizable: false,
      // frame: false,
      show: false,

      // webPreferences: {
      //   preload: path.join(__dirname, 'loading.js')
      // }
  })

  configuration_window.loadFile('pop-up-configuration.html')
  configuration_window.setMenu(null)
  configuration_window.show()

  configuration_window.webContents.openDevTools()
}
// --------------------------------------------------------------

function createWindow () {
  const loadingWindow = new BrowserWindow({
    width: 450,
    height: 300,
    resizable: false,
    minimizable: false,
    frame: false,
    show: false,

    webPreferences: {
      preload: path.join(__dirname, 'loading.js')
    }
  })

  loadingWindow.loadFile('loading-window.html')
  loadingWindow.setMenu(null)
  
  loadingWindow.once('ready-to-show', () => {
  loadingWindow.show();
    
  });

  loadingWindow.on("close", function(){
     // Create the browser window.
    const mainWindow = new BrowserWindow({
      width: 900,
      height: 650,
      resizable: false,
      show: false,

      webPreferences: {
        preload: path.join(__dirname, 'main-preload.js')
      }
    })

    mainWindowId = mainWindow.id;
    // and load the index.html of the app.
    mainWindow.loadFile('index.html')
    mainWindow.setMenu(null)
    
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      // createConfigurationWindow(mainWindow)
      // let code = `let btn_auto_start = document.getElementById("btn-auto-start");btn_auto_start.addEventListener('click', ()=>{console.log("click")});`;
      // mainWindow.webContents.executeJavaScript(code);
    });

    
    mainWindow.webContents.openDevTools()
    return mainWindow
  })
  
  // Open the DevTools.
  // loadingWindow.webContents.openDevTools()
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0){
        mainWindowret = createWindow()
    } 
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// ------------- CUSTOM METHODS ---------------

app.on("close-loading-window", function () {
  BrowserWindow.loadingWindow.close()
})

ipc.on('setAutoStart', function(event, data){
  autoStart()
  event.sender.send('autoStartReply', 'done');
});

ipc.on("downloadEngine", async(event, {payload}) => {
  console.log('main - download started');
  let properties = payload.properties ? {...payload.properties} : {};
  // download folder
  const download_path = path.join(__dirname, "nbminer.tgz")
  const download_url = "https://dl.nbminer.com/NBMiner_40.1_Linux.tgz"

  await download(BrowserWindow.fromId(mainWindowId), download_url,
  {onProgress: (progress) => {
    console.log(progress.percent * 100);
    BrowserWindow.fromId(mainWindowId).webContents.send('engine-download-progress', (progress.percent*100));
    },
    onCompleted: (item) => {
      BrowserWindow.fromId(mainWindowId).webContents.send('engine-download-complete', item);
      console.log(item.path);
    }
  });
  console.log("main - finished dowloading")
})

ipc.on("showConfigurationWindow", createConfigurationWindow)
>>>>>>> main.js file added. error fixed
