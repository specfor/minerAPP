// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, Notification } = require('electron')
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
let config_file = '';
// console.log(config_file_path);
try{
  config_file = JSON.parse(fs.readFileSync(config_file_path));
  console.log('Runnig version - ' + config_file['version'])
}catch(err){
  let content = {"version": "1.0.0", "app_path": __dirname}
  fs.writeFileSync(config_file_path, JSON.stringify(content));
  config_file = JSON.parse(fs.readFileSync(config_file_path));
}
console.log(process.execPath + ' 9999 ' + process.execArgv)
var mainWindowId = null;
var engine_pid = null;


function autoStart(enable = true){
  var AutoLauncher = new AutoLaunch({
    name: 'minehash',
    // path: process.execArgv + ' ' + config_file['app_path']
  });
  
  // console.log(AutoLauncher.isEnabled())
  // AutoLauncher.enable()
  // console.log(AutoLauncher.isEnabled())

  if (enable) {
    AutoLauncher.enable()
    console.log('Program set to run on start.')
  }else{
    AutoLauncher.disable()
    console.log('Program removed from running at start.')
  }
}

// ------------------------- MINER PROGRAM ---------------------------
function AutoMine() {
  if (config_file['auto_mine']) {
    console.log("Automatically running miner plugin at power on.")
    let details = getMinerDetails()
    runEngine(details['selected'], details[details['selected']]['selected_coin'])
  }
}

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

    const notification = {
      title: 'Plugin Downloaded,',
      body: 'Plugin successfully downloaded and installed.',
    }
    new Notification(notification).show()

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
        save_bat = tmp_bat[0] + '-o ' + engine_details['pool_address'] + ' -u ' + engine_details['wallet_address'] + '.rig_windows -p x\r\npause';
      }catch(err){
        console.error('Error while editing coin bat file.' + err)
      }
    }else{
      if (engine_name == 'gminer') {
        executable_file = 'mine_'+ coin_name +'.bat';
        executable_path = path.join(__dirname, "downloads/gminer/" + executable_file);

        try{
          let bat_data = fs.readFileSync(executable_path, 'utf8');
          tmp_bat = bat_data.split('--server ');
          // tmp_bat2 = tmp_bat[1].split('.default');
          save_bat = tmp_bat[0] + '--server ' + engine_details['pool_address'] + ' --user ' + engine_details['wallet_address'] + '\r\npause';
        }catch{
          console.error('Error while editing coin bat file.')
        }
      }
    }
  }

  // make changes in bat file
  try{
    console.log(save_bat)
    fs.writeFileSync(executable_path, save_bat, {flag: 'w+'});
  }catch(err){
    console.error(err);
  }

  console.log('Starting program - ' + executable_file);
  // console.log('Starting program - ' + executable_path);

  let engine = child.spawn(executable_path, {detached: true, stdio: 'ignore'});
  engine_pid = engine.pid;
  
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
    data = {'nbminer': {'pool_address':'', 'wallet_address':'', 'extra_param':'', 'supported_coins': ['ae', 'beam', 'config', 'conflux', 'ergo', 'etc', 'eth_overclock', 'eth', 'rvn'], 'selected_coin': 'no_coin_selected', 'path':''},
    'trex': {'pool_address':'', 'wallet_address':'', 'extra_param':'', 'supported_coins': ['ERGO', 'ETC', 'ETH', 'FIRO', 'RVN', 'SERO', 'VBK', 'VEIL', 'ZANO'], 'selected_coin': 'no_coin_selected', 'path':''}, 
    'gminer': {'pool_address':'', 'wallet_address':'', 'extra_param':'', 'supported_coins': ['aetenity', 'aion', 'beam', 'btg', 'cortex', 'etc', 'eth', 'ravencoin', 'zelcash'], 'selected_coin': 'no_coin_selected', 'path':''}, 'selected': 'nbminer'};
    
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

function saveAppDetails(auto_update, auto_run, gpu_check, auto_mine, resolve_internet, resolve_common_err){
  try{
    if (auto_run) {
      autoStart()
    }else{
      autoStart(false);
    }

    config_file['auto_update'] = auto_update;
    config_file['auto_run'] = auto_run;
    config_file['gpu_check'] = gpu_check;
    config_file['auto_mine'] = auto_mine;
    config_file['resolve_internet'] = resolve_internet;
    config_file['resolve_common_err'] = resolve_common_err;

    fs.writeFileSync(config_file_path, JSON.stringify(config_file));
  }catch(err){
    console.error('Error saving app config settings')
  }
  
}

// ------------------------------ UPDATE -----------------------------------
function check_updates(do_download=false){
  if (!do_download) {
    console.log("Checking for updates")
  }
  let check_update_link = 'https://minerhouse.lk/wp-content/uploads/updates.json';
  let options = {json: true};
  try{
    request(check_update_link, options, (error, res, body) => {
      if (error) {
          return  console.log(error);
      };
    
      if (!error && res.statusCode == 200) {
        let version = body['version'];
        let download_url = body['download_link'];
        let download_path = app.getPath('downloads');
  
        if (version != config_file['version']) {
          if (do_download) {
            console.log("Downloading updates")
  
            download(BrowserWindow.fromId(mainWindowId), download_url,
            {directory:download_path ,onProgress: (progress) => {
              // console.log(progress.percent * 100);
              BrowserWindow.fromId(mainWindowId).webContents.send('engine-download-progress', (progress.percent*100).toFixed(1).toString());
              },
              onCompleted: (item) => {
                BrowserWindow.fromId(mainWindowId).webContents.send('update-download-complete', item.path);
                const notification = {
                  title: 'Update Downloaded,',
                  body: 'You need to manually run and install the setup located at ' + item.path
                }
                new Notification(notification).show()
              }
            }); 
          }else{
            BrowserWindow.fromId(mainWindowId).webContents.send("updates-available")
          }
        }
      }
    });
  }catch(err){
    console.error('Check for update failed', err)
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
    icon: 'icon.png',

    webPreferences: {
      preload: path.join(__dirname, 'loading.js')
    }
  })

  loadingWindow.loadFile( path.join(__dirname, 'loading-window.html'));
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
      icon: 'icon.png',
      alwaysOnTop:true,

      webPreferences: {
        preload: path.join(__dirname, 'main-preload.js')
      }
    })

    mainWindowId = mainWindow.id;
    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'index.html'))
    mainWindow.setMenu(null)
    
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
    });
    check_updates()
    AutoMine()
    
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
      createWindow()
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

ipc.on("save-app-config", (event, args)=>{
  saveAppDetails(args['check_auto_update'], args['check_auto_run'], args['check_gpu_check'], args['check_auto_mine'], args['check_resolve_internet'], args['check_fix_common_err'])
  event.sender.send("app-config", config_file);
})

ipc.on('get-app-config', (event, args)=>{
  event.sender.send('app-config', config_file);
});

ipc.on("check-for-updates", check_updates);

ipc.on("download-updates", ()=>{check_updates(true)});


ipc.on("showConfigurationWindow", createConfigurationWindow);
