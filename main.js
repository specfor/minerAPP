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
const request = require('request');

let config_file_path = path.join(app.getPath('userData'), 'config.json');
try{
  const config = require(config_file_path);
}catch(err){
  let content = {"version": "1.0.0"}
  fs.writeFileSync(config_file_path, JSON.stringify(content));
  const config = require(config_file_path);
}

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
function checkEnginePrecence(engine_name) {
  let miner_detail = getMinerDetails(engine_name);
  if (miner_detail['path'] == '') {
    
  }

}

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
    let data = fs.readFileSync(path.join(app.getPath('userData'),'engines.json'), 'utf8');
    if (!isEmptyOrSpaces(engine)) {
      data = data['engine'];
    }
    data = JSON.parse(data);
    return data;
  }catch(err){
    data = {'nbminer': {'pool_address':'', 'wallet_address':'', 'coin':'', 'extra_param':'', 'supported_coins': ['ETH', 'RVN', 'BEAM', 'CFX', 'ZIL', 'ERGO', 'AE'], 'selected_coin': '', 'path':''},
    'trex': {'pool_address':'', 'wallet_address':'', 'coin':'', 'extra_param':'', 'supported_coins': ['ETH', 'RVN', 'BEAM', 'CFX', 'ZIL', 'ERGO', 'AE'], 'selected_coin': '', 'path':''}, 
    'gminer': {'pool_address':'', 'wallet_address':'', 'coin':'', 'extra_param':'', 'supported_coins': ['ETH', 'RVN', 'BEAM', 'CFX', 'ZIL', 'ERGO', 'AE'], 'selected_coin': '', 'path':''}, 'selected': 'nbminer'};
    
    let wdata = JSON.stringify(data);
    try{
      fs.writeFileSync(path.join(app.getPath('userData'),'engines.json'), wdata, {flag: 'w+'});
    }catch(err){
      console.error(err);
    }
    // console.error(err)
    return data;
  }
}

function saveMinerDetails(engine, pool_address, wallet_address, coin, extra_param ) {
  // console.log(engine + ' ' + algorithm + ' ' + server + ' ' +pool_address+ ' ' +wallet_address )
  let data = getMinerDetails()

  data[engine]['pool_address'] = pool_address;
  data[engine]['wallet_address'] = wallet_address;
  data[engine]['selected_coin'] = coin;
  data[engine]['extra_param'] = extra_param;
  data['selected'] = engine;

  let wdata = JSON.stringify(data);
  try{
    fs.writeFileSync(path.join(app.getPath('userData'),'engines.json'), wdata, {flag: 'w+'});
  }catch(err){
    console.error(err);
  }
}

// ------------------------------ UPDATE -----------------------------------
function check_updates(){
  let check_update_link = '';
  let options = {json: true};
  
  request(check_update_link, options, (error, res, body) => {
    if (error) {
        return  console.log(error);
    };
  
    if (!error && res.statusCode == 200) {
        let version = body['version'];
        let download_url = body['download_link'];
        let download_path = app.getPath('downloads');

        if (version != config['version']) {
          download(BrowserWindow.fromId(mainWindowId), download_url,
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
        }
    }
  });
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

ipc.on("downloadEngine", async(event, engine_name) => {
  console.log('main - download started');
  // download folder
  const download_path = path.join(__dirname, "downloads");
  
  if (engine_name == "nbminer") {
    const download_url = "https://dl.nbminer.com/NBMiner_40.1_Win.zip";
  }else{
    if (engine_name == 'trex') {
      const download_url = 'https://github.com/trexminer/T-Rex/releases/download/0.25.2/t-rex-0.25.2-win.zip';
    }else{
      const download_url = 'https://github.com/develsoftware/GMinerRelease/releases/download/2.78/gminer_2_78_windows64.zip';
    }
  }
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
  saveMinerDetails(args['engine'],  args['pool_address'], args['wallet_address'], args['coin'], args['extra_param'])
  let config_data = getMinerDetails();
  event.sender.send('engine-config', config_data);
});
ipc.on('get-engine-config', (event, args)=>{
  let config_data = getMinerDetails();
  event.sender.send('engine-config', config_data);
});

ipc.on("showConfigurationWindow", createConfigurationWindow);
