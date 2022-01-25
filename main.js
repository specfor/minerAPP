// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('path')

var AutoLaunch = require('auto-launch');

function autoStart(){
  var AutoLauncher = new AutoLaunch({
    name: 'Minersupp',
    // path: '/Applications/Minecraft.app',
  });
  
  
  console.log(AutoLauncher.isEnabled())
  if (AutoLauncher.isEnabled()) {
    AutoLauncher.disable()
    console.log('disabled')
  }else{
    AutoLauncher.enable()
    
    console.log('enabled')
  }
  AutoLauncher.enable();
}

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
      // webPreferences: {
      //   preload: path.join(__dirname, 'preload.js')
      // }
    })

    
    // and load the index.html of the app.
    mainWindow.loadFile('index.html')
    mainWindow.setMenu(null)
    
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      btn_auto_start = mainWindow.document.getElementById("btn-auto-start")
      
      btn_auto_start. addEventListener("click", autoStart)
    });

    
    // mainWindow.webContents.openDevTools()
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
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
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