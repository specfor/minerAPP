// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcRenderer } = require('electron')
const path = require('path')
const {download} = require('electron-dl')
const ipc = require('electron').ipcMain;
const extract = require('extract-zip')
const AutoLaunch = require('auto-launch');
const child = require('child_process');
const fs = require('fs');
const { isEmptyOrSpaces } = require('builder-util');

var mainWindowId = null;
var engine_pid = null;


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

// ------------------------- MINER PROGRAM ---------------------------
function runEngine(){
  console.log("miner process called to run")

  engine_name = 'nbminer';
  coin_name = 'eth';
  
  if (engine_name == 'nbminer') {
    if (coin_name == "eth") {
      executable_path = path.join(__dirname, "downloads/NBMiner_Win/start_eth.bat");
      executable_file = 'start_eth.bat';
    }
  }

  let engine = child.spawn(executable_path, {detached: true, stdio: 'ignore'});
  engine_pid = engine.pid;
  // engine.stdout.on('data', (data) => {
  //   console.log('cmd - ' + data.toString());
  // });
  
  // engine.stderr.on('data', (data) => {
  //   console.error('cmd err - ' + data.toString());
  // });
  
  engine.on('exit', (code) => {
    console.log(`Miner program exited with code ${code}`);
  });
}

function killEngine() {
  console.log("process termination called.");
  child.exec(`taskkill /pid ${engine_pid} /t`);
}

// ----------------------------- SETTINGS ----------------------------
function getMinerDetails(engine="") {
  try{
    let data = fs.readFileSync('engines.json', 'utf8');
    if (!isEmptyOrSpaces(engine)) {
      data = data['engine'];
    }
    data = JSON.parse(data);
    return data;
  }catch(err){
    console.error(err)
    return false;
  }
}

function saveMinerDetails(engine, pool_address, wallet_address, algorithm, extra_param ) {
  // console.log(engine + ' ' + algorithm + ' ' + server + ' ' +pool_address+ ' ' +wallet_address )
  let data = getMinerDetails()
  if (!data) {
    data = {'nbminer': {'pool_address':'', 'wallet_address':'', 'algorithm':'', 'extra_param':''},
    'trex': {'pool_address':'', 'wallet_address':'', 'algorithm':'', 'extra_param':''}, 
    'gminer': {'pool_address':'', 'wallet_address':'', 'algorithm':'', 'extra_param':''}, 'selected': ''};
  }

  data[engine]['pool_address'] = pool_address;
  data[engine]['wallet_address'] = wallet_address;
  data[engine]['algorithm'] = algorithm;
  data[engine]['extra_param'] = extra_param;
  data['selected'] = engine;

  let wdata = JSON.stringify(data);
  try{
    fs.writeFileSync('engines.json', wdata, {flag: 'w+'});
  }catch(err){
    console.error(err);
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
      // frame: false,
      width: 450,
      height: 338,
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

  //configuration_window.webContents.openDevTools()
}
// --------------------------------------------------------------

function createWindow () {
  const loadingWindow = new BrowserWindow({
    width: 250,
    height: 200,
    resizable: false,
    minimizable: false,
    frame: false,
    show: false,

    webPreferences: {
      preload: path.join(__dirname, 'loading.js')
    }
  })

  loadingWindow.loadFile('loading-window.html');
  loadingWindow.setMenu(null);
  
  loadingWindow.once('ready-to-show', () => {
  loadingWindow.show();
    
  });

  loadingWindow.on("close", function(){
     // Create the browser window.
    const mainWindow = new BrowserWindow({
      width: 600,
      height: 450,
      resizable: false,
      show: false,
      alwaysOnTop:true,

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
  const download_path = path.join(__dirname, "downloads")
  // const download_url = "https://dl.nbminer.com/NBMiner_40.1_Linux.tgz"
  const download_url = "https://dl.nbminer.com/NBMiner_40.1_Win.zip";
  let download_file = "";

  await download(BrowserWindow.fromId(mainWindowId), download_url,
  {directory:download_path ,onProgress: (progress) => {
    // console.log(progress.percent * 100);
    BrowserWindow.fromId(mainWindowId).webContents.send('engine-download-progress', (progress.percent*100).toFixed(1).toString());
    },
    onCompleted: (item) => {
      BrowserWindow.fromId(mainWindowId).webContents.send('engine-download-complete', item);
      // console.log(item.path);
      download_file = item.path;
    }
  });
  console.log("main - finished dowloading");
 
  try {
    await extract(download_file, { dir: download_path })
    console.log('Extraction complete');
  } catch (err) {
    console.log("Download extract error - " + err);
    // handle any errors
  }
  
})


ipc.on('run-mining-engine', runEngine);
ipc.on('kill-mining-engine', killEngine);
ipc.on('save-engine-config', function(event, args){
  saveMinerDetails(args['engine'],  args['pool_address'], args['wallet_address'], args['algorithm'], args['extra_param'])
  let config_data = getMinerDetails();
  event.sender.send('engine-config', config_data);
});
ipc.on('get-engine-config', (event, args)=>{
  let config_data = getMinerDetails();
  event.sender.send('engine-config', config_data);
})

ipc.on("showConfigurationWindow", createConfigurationWindow);

ipc.on('close-app', ()=>{app.quit()});
ipc.on('minimize-app', ()=>{BrowserWindow.getFocusedWindow().minimize()});
ipc.on('maximize-app', ()=>{BrowserWindow.getFocusedWindow().maximize()});
