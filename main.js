// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('path')
const {download} = require('electron-dl')
const ipcRend =  require('electron').ipcRenderer;
const ipc = require('electron').ipcMain;
const extract = require('extract-zip')
const AutoLaunch = require('auto-launch');
const child = require('child_process');
const fs = require('fs');
const { isEmptyOrSpaces } = require('builder-util');
const request = require('request');

let config_file_path = path.join(app.getPath('userData'), 'config.json');
// console.log(config_file_path);
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

  // if (AutoLauncher.isEnabled()) {
  //   AutoLauncher.disable()
  //   console.log('disabled')
  // }else{
  //   AutoLauncher.enable()
  //   console.log('enabled')
  // }
}

// ------------------------- MINER PROGRAM ---------------------------
async function downloadEngine(engine_name){
  console.log('main - download started');
  let download_url = '';
  let download_path = '';

  if (engine_name == "nbminer") {
    download_url = "https://dl.nbminer.com/NBMiner_40.1_Win.zip";
    download_path = path.join(__dirname, "downloads");
  }else{
    if (engine_name == 'trex') {
      download_url = 'https://github.com/trexminer/T-Rex/releases/download/0.25.2/t-rex-0.25.2-win.zip';
      download_path = path.join(__dirname, "downloads/trex");

    }else{
      if (engine_name == 'gminer') {
        download_url = 'https://github.com/develsoftware/GMinerRelease/releases/download/2.78/gminer_2_78_windows64.zip';
        download_path = path.join(__dirname, "downloads/gminer");
      }else{
        return false;
      }
    }
  }
  let download_file = "";

  await download(BrowserWindow.fromId(mainWindowId), download_url,
  {directory:download_path ,onProgress: (progress) => {
    // console.log(progress.percent * 100);
    BrowserWindow.fromId(mainWindowId).webContents.send('engine-download-progress', (progress.percent*100).toFixed(1).toString());
    },
    onCompleted: (item) => {
      BrowserWindow.fromId(mainWindowId).webContents.send('engine-download-complete');
      // console.log(item.path);
      download_file = item.path;
    }
  });
  console.log("main - finished dowloading");
 
  try {
    await extract(download_file, { dir: download_path });
    console.log('Extraction complete');
    if (engine_name == 'nbminer') {
      download_path = path.join(download_path, 'NBMiner_Win');
    }
    let miner_detail = getMinerDetails(engine_name);
    saveMinerDetails(engine_name, miner_detail['pool_address'], miner_detail['wallet_address'], miner_detail['coin'], miner_detail['extra_param'], download_path);

  } catch (err) {
    console.error("Download extract error - " + err);
    // handle any errors
  }

  return true;
}

async function checkEnginePresence(engine_name) {
  console.log("Looking for the mining program.")
  let miner_detail = getMinerDetails(engine_name);
  if (miner_detail['path'] == '') {
    console.log("Need to download miner program.");
    BrowserWindow.fromId(mainWindowId).webContents.send('engine-download-started');

    let down_status = await downloadEngine(engine_name);
  }

}

async function runEngine(engine_name, coin_name){
  // engine_name = 'trex';
  // coin_name = 'eth';
  let engine_details = getMinerDetails(engine_name);

  await checkEnginePresence(engine_name);  

  console.log("miner process called to run");
  console.log('plugin - ' + engine_name + ' & coin - ' + coin_name);

  let save_bat = '';

  if (engine_name == 'nbminer') {
    executable_file = 'start_'+ coin_name +'.bat';
    executable_path = path.join(__dirname, "downloads/NBMiner_Win/" + executable_file);
    
    try{
      let bat_data = fs.readFileSync(executable_path, 'utf8');
      tmp_bat = bat_data.split('-o ');
      save_bat = tmp_bat[0] + '-o ' + engine_details['pool_address'] + ' -u ' + engine_details['wallet_address'] + '.rig_windows -log\r\npause';
    }catch{
      console.error('Error while editing coin bat file.')
    }
  }else{
    if (engine_name == 'trex') {
      let pool_name = engine_details['pool_address'].split('.')[1];
      executable_file = coin_name + '-' + pool_name + '.bat';
      executable_path = path.join(__dirname, "downloads/trex/" + executable_file);

      try{
        let bat_data = fs.readFileSync(executable_path, 'utf8');
        tmp_bat = bat_data.split('-o ');
        tmp_bat2 = tmp_bat[1].split('.default');
        save_bat = tmp_bat[0] + '-o ' + engine_details['pool_address'] + ' -u ' + engine_details['wallet_address'] + '.rig_windows -p x\r\npause';
      }catch{
        console.error('Error while editing coin bat file.')
      }
    }else{
      if (engine_name == 'gminer') {
        executable_file = 'mine_'+ coin_name +'.bat';
        executable_path = path.join(__dirname, "downloads/gminer/" + executable_file);

        try{
          let bat_data = fs.readFileSync(executable_path, 'utf8');
          tmp_bat = bat_data.split('--server ');
          tmp_bat2 = tmp_bat[1].split('.default');
          save_bat = tmp_bat[0] + '--server ' + engine_details['pool_address'] + ' --user ' + engine_details['wallet_address'] + tmp_bat2[1];
        }catch{
          console.error('Error while editing coin bat file.')
        }
      }
    }
  }

  // make changes in bat file
  try{
    fs.writeFileSync(executable_path, save_bat, {flag: 'w+'});
  }catch(err){
    console.error(err);
  }

  console.log('Starting program - ' + executable_file);
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
    data = JSON.parse(data);

    if (!isEmptyOrSpaces(engine)) {
      data = data[engine];
    }
    return data;
  }catch(err){
    data = {'nbminer': {'pool_address':'', 'wallet_address':'', 'coin':'', 'extra_param':'', 'supported_coins': ['ae', 'beam', 'config', 'conflux', 'ergo', 'etc', 'eth_overclock', 'eth', 'rvn'], 'selected_coin': 'no_coin_selected', 'path':''},
    'trex': {'pool_address':'', 'wallet_address':'', 'coin':'', 'extra_param':'', 'supported_coins': ['ERGO', 'ETC', 'ETH', 'FIRO', 'RVN', 'SERO', 'VBK', 'VEIL', 'ZANO'], 'selected_coin': 'no_coin_selected', 'path':''}, 
    'gminer': {'pool_address':'', 'wallet_address':'', 'coin':'', 'extra_param':'', 'supported_coins': ['aetenity', 'aion', 'beam', 'btg', 'cortex', 'etc', 'eth', 'ravencoin', 'zelcash'], 'selected_coin': 'no_coin_selected', 'path':''}, 'selected': 'nbminer'};
    
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

function saveMinerDetails(engine, pool_address, wallet_address, coin, extra_param, engine_path='' ) {
  // console.log(engine + ' ' + algorithm + ' ' + server + ' ' +pool_address+ ' ' +wallet_address )
  let data = getMinerDetails()

  data[engine]['pool_address'] = pool_address;
  data[engine]['wallet_address'] = wallet_address;
  data[engine]['selected_coin'] = coin;
  data[engine]['extra_param'] = extra_param;
  data['selected'] = engine;

  if (!isEmptyOrSpaces(engine_path)) {
    data[engine]['path'] = engine_path;
  }

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
            // download_file = item.path;
            alert('Update downloaded to - ' + download_path + '\nYOU NEED TO MANUALLY INSTALL BY RUNNING SETUP\n' + item.path)
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
  autoStart()

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

ipc.on("downloadEngine", (event, engine_name) => {
  let down_status = downloadEngine(engine_name); 
})


ipc.on('run-mining-engine', (event,args)=>{
  runEngine(args['plugin'], args['coin'])
});
ipc.on('kill-mining-engine', killEngine);

ipc.on('reset-engine-config', (event, args)=>{
  saveMinerDetails(args['engine'], '', '', 'no_coin_selected', '');
  let config_data = getMinerDetails();
  event.sender.send('engine-config', config_data);
})

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
