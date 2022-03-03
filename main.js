// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, Notification, dialog } = require('electron')
const path = require('path')
const {download} = require('electron-dl')
const ipcRend =  require('electron').ipcRenderer;
const ipc = require('electron').ipcMain;
const extract = require('extract-zip')
const AutoLaunch = require('auto-launch');
const child = require('child_process');
const fs = require('fs');
const { isEmptyOrSpaces, retry } = require('builder-util');
const request = require('request');
const { setTimeout } = require('timers');
const { cwd, pid } = require('process');

var mainWindowId, loadingWindowId = null;
var engine_pid = 0;
let config_file = '';
var first_run = false;
var mining_coin = '';
var mining = false, plugin_updating = false, downloading = false;
var active_engine_name, start_time = '';
var downloading_plugins = [];
var downloading_versions = [];
var run_lock = true;
var mainWindow_tasks = [];
var gpu_details = [];
var gpu_count = 0;

let config_file_path = path.join(app.getPath('userData'), 'config.json');
try{
  config_file = JSON.parse(fs.readFileSync(config_file_path));
  console.log('Runnig version - ' + config_file['version'])
}catch(err){
  first_run = true;
  let content = {"version": "1.0.0", "app_path": __dirname}
  fs.writeFileSync(config_file_path, JSON.stringify(content));
  config_file = JSON.parse(fs.readFileSync(config_file_path));
}

setInterval(() => {
  if (!mining && engine_pid != 0) {
    engine_pid = 0;
    BrowserWindow.fromId(mainWindowId).webContents.send('miner-stopped');
  }
}, 3000);

setInterval(() => {
  if (mining) {
    sendMiningStatus()
  }
}, 1000);

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds;
}

function autoStart(enable = true){
  var AutoLauncher = new AutoLaunch({
    name: 'minehash'
  });

  if (enable) {
    AutoLauncher.enable()
    console.log('Program set to run on start.')
  }else{
    AutoLauncher.disable()
    console.log('Program removed from running at start.')
  }
}

async function pluginFileMissing(engine_name) {
  const notification = {
    icon:'icon.png',
    title: 'Plugin File Missing,',
    body: 'A plugin file is missing. This can be because an anti-virus program deleting the file.Plugin will be downloaded again.Try disabling any anit-virus if unabled.',
  }
  new Notification(notification).show();

  await downloadEngine(engine_name);
}

function checkFilePresence(file_path) {
  if (fs.existsSync(file_path)) {
    return true
  }
  return false;
}
// ------------------------- MINER PROGRAM ---------------------------
async function AutoMine() {
  if (!config_file['auto_mine']) {
    return
  }
  if (plugin_updating || downloading_plugins.length > 0 || run_lock) {
  setTimeout(AutoMine, 5000)
  console.log('awaiting download finish to run miner')
  return
  }
  // if (config_file['auto_mine']) {
  let details = getMinerDetails()
  await checkEnginePresence(details['selected']);
  if (!isEmptyOrSpaces(details[details['selected']]['selected_coin']) && !isEmptyOrSpaces(details[details['selected']]['pool_address']) && !isEmptyOrSpaces(details[details['selected']]['wallet_address']) && !isEmptyOrSpaces(details[details['selected']]['path'])) {
    console.log("Automatically running miner plugin at power on.")
    runEngine(details['selected'], details[details['selected']]['selected_coin'])
    BrowserWindow.fromId(mainWindowId).webContents.send('run-miner')
  }
  
}


async function downloadEngine(engine_name, download_data=''){
  let download_url, download_path = '';

  if (engine_name == 'all') {
    if (downloading) {
      console.log('Download in progress. pending')
      setTimeout(()=>{downloadEngine('all')}, 5000)
    }else if (downloading_plugins.length > 0) {
      console.log('started new download')
      downloadEngine(downloading_plugins[0])
      downloading = true;
      setTimeout(()=>{downloadEngine('all')}, 5000)
    }else{
      plugin_updating = false;
      return
    }
  }else if (download_data == '') {
    if (!downloading_plugins.includes(engine_name)) {
      downloading_plugins.push(engine_name)
    }
    downloading = true;
    console.log('Plugin download started');
    
    let check_update_link = 'https://minerhouse.lk/wp-content/uploads/updates.json';
    let options = {json: true};
    request(check_update_link, options, (error, res, body) => {    
      try{
        if (!error && res.statusCode == 200) {
          downloadEngine(engine_name, body)
        }
      }catch(err){
      console.error('Download plugin failed.', err.message)
      }
    });
  }else{
    downloading_versions.push(download_data[engine_name]['version'])
    download_url = download_data[engine_name]['download_link'];
  
    if (engine_name == "nbminer") {
      download_path = path.join(app.getPath('userData'), "minehash-downloads");
    }else if (engine_name == 'trex') {
      download_path = path.join(app.getPath('userData'), "minehash-downloads/trex");
    }else if (engine_name == 'gminer') {
      download_path = path.join(app.getPath('userData'), "minehash-downloads/gminer");
    }
    
    console.log('File downloading to ' + download_path)
    let download_file = "";
  
    BrowserWindow.fromId(mainWindowId).webContents.send('engine-download-started');
  
    await download(BrowserWindow.fromId(mainWindowId), download_url,
    {directory:download_path, overwrite: true, onProgress: (progress) => {
      // console.log(progress.percent * 100);
      BrowserWindow.fromId(mainWindowId).webContents.send('engine-download-progress', (progress.percent*100).toFixed(1).toString());
      },
      onCompleted: (item) => {
        if (downloading_plugins.length > 0) {
          downloading_plugins.splice(downloading_plugins.indexOf(engine_name), 1)
        }
        BrowserWindow.fromId(mainWindowId).webContents.send('engine-download-complete');
        // console.log(item.path);
        download_file = item.path;
      }
    });
    console.log("Plugin finished dowloading");
   
    try {
      console.log('extract ' + download_file + ' to ' + download_path)
      await extract(download_file, { dir: download_path });
      downloading = false;
  
      console.log('Extraction complete');
      if (engine_name == 'nbminer') {
        download_path = path.join(download_path, 'NBMiner_Win');
      }
  
      const notification = {
        icon:'icon.png',
        title: 'Plugin Downloaded,',
        body: 'Plugin successfully downloaded and installed.',
      }
      new Notification(notification).show()
  
      let miner_detail = getMinerDetails(engine_name);
      saveMinerDetails(engine_name, miner_detail['pool_address'], miner_detail['wallet_address'], miner_detail['selected_coin'], miner_detail['extra_param'], download_path, downloading_versions[0]);
      downloading_versions.splice(0, 1)
    } catch (err) {
      console.error("Download extract error - " + err);
      // handle any errors
    }
  }
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
  if (run_lock) {
    setTimeout(()=>{runEngine(engine_name, coin_name)}, 5000)
    return
  }
  let engine_details = getMinerDetails(engine_name);

  await checkEnginePresence(engine_name);  

  engine_details = getMinerDetails(engine_name);

  mining_coin = coin_name.toUpperCase();

  console.log("Miner process called to run");
  console.log('Plugin - ' + engine_name + ' & coin - ' + coin_name);

  let save_bat = '';

  if (engine_name == 'nbminer') {
    executable_file = 'start_'+ coin_name +'.bat';
    executable_path = path.join(engine_details['path'], executable_file);
    
    let present = checkFilePresence(executable_path)
    if (!present) {     
      await pluginFileMissing(engine_name);
    }

    console.log('Updating file - ' + executable_path)

    try{
      let bat_data = fs.readFileSync(executable_path, 'utf8');
      tmp_bat = bat_data.split('-o ');
      save_bat = tmp_bat[0] + '-o ' + engine_details['pool_address'] + ' -u ' + engine_details['wallet_address'] + '.rig_windows --api 127.0.0.1:20001 -log\r\npause';
    }catch(err){
      console.error('Error while editing coin bat file.'+ err.message)
    }
  }else if (engine_name == 'trex') {
    let pool_name = engine_details['pool_address'].split('.')[1];
    executable_file = coin_name + '-' + pool_name + '.bat';
    executable_path = path.join(engine_details['path'], executable_file);
    
    let present = checkFilePresence(executable_path)
    if (!present) {
      await pluginFileMissing(engine_name);
    }
    console.log('Updating file - ' + executable_path)

    try{
      let bat_data = fs.readFileSync(executable_path, 'utf8');
      tmp_bat = bat_data.split('-o ');
      save_bat = tmp_bat[0] + '-o ' + engine_details['pool_address'] + ' -u ' + engine_details['wallet_address'] + '.rig_windows --api-bind-http 127.0.0.1:20002 -p x\r\npause';
    }catch(err){
      console.error('Error while editing coin bat file.' + err.message)
    }
  }else if (engine_name == 'gminer') {
    executable_file = 'mine_'+ coin_name +'.bat';
    executable_path = path.join(engine_details['path'], executable_file);

    let present = checkFilePresence(executable_path)
    if (!present) {
      await pluginFileMissing(engine_name);
    }
    console.log('Updating file - ' + executable_path)

    try{
      let bat_data = fs.readFileSync(executable_path, 'utf8');
      tmp_bat = bat_data.split('--server ');
      // tmp_bat2 = tmp_bat[1].split('.default');
      save_bat = tmp_bat[0] + '--server ' + engine_details['pool_address'] + ' --user ' + engine_details['wallet_address'] + ' --api 20003\r\npause';
    }catch(err){
      console.error('Error while editing coin bat file. - '+ err.message)
    }
  }

  // make changes in bat file
  try{
    // console.log(save_bat)
    fs.writeFileSync(executable_path, save_bat, {flag: 'w+'});
  }catch(err){
    console.error(err.message);
  }

  console.log('Starting program - ' + executable_file);
  // console.log('Starting program - ' + executable_path);

  let engine = child.spawn(executable_path, {detached: true, stdio: 'ignore', cwd: engine_details['path']});
  active_engine_name = engine_name;
  engine_pid = engine.pid;
  mining = true;
  start_time = Date.now()

  engine.on('error', (err)=>{
    console.error('Error running plugin - ' + err.message);
    let present_ = checkFilePresence(executable_path);
    if (!present_) {
      pluginFileMissing(engine_name);
    }
  })

  engine.on('exit', (code) => {
    console.log(`Miner program exited with code ${code}`);
    mining = false;
  });
}

function killEngine() {
  console.log("process termination called.");
  child.exec(`taskkill /f /pid ${engine_pid} /t`);
}

function killEngine2(pid) {
  console.log("Gpu data gather program termination called.");
  child.exec('taskkill /f /pid '+ pid +' /t');
}

function calculateHashrate(hashrate) {
  if (hashrate > 1000000000) {
    hashrate = Math.round(hashrate / 1000000000) + ' TH/s'
  }else if (hashrate > 1000000) {
    hashrate = Math.round(hashrate / 1000000) + ' MH/s'
  }else if (hashrate > 1000) {
    hashrate = Math.round(hashrate / 1000) + 'KH/s'
  }else{
    hashrate = Math.round(hashrate) + ' H/s'
  }
  return hashrate
}

async function sendMiningStatus(){
  if (active_engine_name == 'nbminer') {
    request('http://127.0.0.1:20001/api/v1/status', {json: true}, (error, res, body) => {
      try{
        if (error) {
          return
        }
        let hashrate = calculateHashrate(body['miner']['total_hashrate_raw']);
        let power = body['miner']['total_power_consume'];
        let uptime = msToTime(Date.now() - start_time);

        let devices = [];
        body['miner']['devices'].forEach(gpu => {
          let gpu_hashrate = calculateHashrate(gpu['hashrate_raw']);
          
          devices.push({'pcie': gpu['pci_bus_id'], 'name': gpu['info'], 'hashrate': gpu_hashrate, 'core-clock': gpu['core_clock'], 'fan': gpu['fan'], 'mem-clock': gpu['mem_clock'], 'power': gpu['power'], 'temperature': gpu['temperature']})
        })

        let payload = {'hashrate': hashrate, 'power': power, 'uptime': uptime, 'coin': mining_coin, 'devices': devices}

        BrowserWindow.fromId(mainWindowId).webContents.send('plugin-status', payload)
      }catch(err){
        console.error('Error getting plugin status - ' + err.message)
      }
      })
  }else if (active_engine_name == 'trex'){
    request('http://127.0.0.1:20002/summary', {json: true}, (error, res, body) => {
      try{
        if (error) {
          return
        }
        let hashrate = calculateHashrate(body['hashrate']);
        let devices = [];
        let power = 0;

        body['gpus'].forEach(gpu=>{
          power += gpu['power'];
          devices.push({'pcie': gpu['pci_id'], 'name': gpu['name'], 'core-clock': gpu['cclock'], 'fan': gpu['fan_speed'], 'mem-clock': gpu['mclock'], 'power': gpu['power'], 'temperature': gpu['temperature']})
        })
        let uptime = msToTime(body['uptime']*1000);

        let payload = {'hashrate': hashrate, 'power': power, 'uptime': uptime, 'coin': mining_coin, 'devices': devices}
   
        BrowserWindow.fromId(mainWindowId).webContents.send('plugin-status', payload)
      }catch(err){
        console.error('Error getting plugin status - ' + err.message)
      }
    })
    
  }else if (active_engine_name == 'gminer') {
    request('http://127.0.0.1:20003/api/v1/status', {json: true}, (error, res, body) => {
      try{
        if (error) {
          return
        }
        // {"start_time":1646306289,"uptime":32,"extended_share_info":true,"miner":
        //   {"devices":
        //     [{"hashrate":16486272,"id":0,"info":"ASUS GeForce GTX 1650 SUPER 4GB","temperature":"51","power":77,"accepted_shares":0,"stale_shares":0,"invalid_shares":0,"rejected_shares":0}],
        //   "total_hashrate":16486272}
        // ,"stratum":
        //   {"shares_per_minute":0.00,"server":"asia-eth.2miners.com:2020","user": "0xbe6a88119d93e9947159f81f242727d2e4cc098e","accepted_shares":0,"stale_shares":0,"invalid_shares":0,"rejected_shares":0}}

        let hashrate = calculateHashrate(body['miner']['devices']['total_hashrate']);
        let devices = [];
        let power = 0;

        body['miner']['devices'].forEach(gpu=>{
          power += gpu['power'];
          devices.push({'pcie': gpu['id'], 'name': gpu['info'], 'core-clock': 'NO DATA', 'fan': 'NO DATA', 'mem-clock': 'NO DATA', 'power': gpu['power'], 'temperature': gpu['temperature']})
        })
        let uptime = msToTime(body['uptime']*1000);

         

        let payload = {'hashrate': hashrate, 'power': power, 'uptime': uptime, 'coin': mining_coin, 'devices': devices}

        BrowserWindow.fromId(mainWindowId).webContents.send('plugin-status', payload)
      }catch(err){
        console.error('Error getting plugin status - ' + err.message)
      }
    })
  }
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
    data = {'nbminer': {'pool_address':'', 'wallet_address':'', 'extra_param':'', 'supported_coins': ['ae', 'beam', 'conflux', 'ergo', 'etc', 'eth_overclock', 'eth', 'rvn'], 'selected_coin': 'no_coin_selected', 'path':'', 'version': ''},
    'trex': {'pool_address':'', 'wallet_address':'', 'extra_param':'', 'supported_coins': ['ERGO', 'ETC', 'ETH', 'FIRO', 'RVN', 'SERO', 'VBK', 'VEIL', 'ZANO'], 'selected_coin': 'no_coin_selected', 'path':'', 'version': ''}, 
    'gminer': {'pool_address':'', 'wallet_address':'', 'extra_param':'', 'supported_coins': ['aetenity', 'aion', 'beam', 'btg', 'cortex', 'etc', 'eth', 'ravencoin', 'zelcash'], 'selected_coin': 'no_coin_selected', 'path':'', 'version': ''}, 'selected': 'nbminer'};
    
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

function saveMinerDetails(engine, pool_address, wallet_address, coin, extra_param, engine_path='', engine_version='' ) {
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
  if (!isEmptyOrSpaces(engine_version)) {
    data[engine]['version'] = engine_version;
  }

  let wdata = JSON.stringify(data);
  try{
    console.log('Plugin details save to '+path.join(app.getPath('userData'),'engines.json'))
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

function getGpuDetails(){
  BrowserWindow.fromId(loadingWindowId).webContents.send("checking-gpu-data")

  console.log('Gathering gpu devices')

  if (plugin_updating || downloading_plugins.length > 0) {
    console.log('waiting to get gpu data')
    setTimeout(getGpuDetails, 5000)
    return
  }
  let nb_details = getMinerDetails('nbminer');

  if (nb_details['path'] == "") {
    return
  }

  let gpu_detection_content = '@cd /d "%~dp0"\r\nnbminer -a etchash -o asia-eth.2miners.com:2020 -u 0xbe6a88119d93e9947159f81f242727d2e4cc098e.default --api 127.0.0.1:20005\r\npause';
  fs.writeFileSync(path.join(nb_details['path'], 'gpu_detection.bat'),  gpu_detection_content);

  let nb = child.spawn(path.join(nb_details['path'], 'gpu_detection.bat'), {stdio: 'ignore', cwd: nb_details['path']})
  let nb_pid = nb.pid;

  nb.on('close', (code)=>{
    console.log('gpu program close with code ' + code)
    run_lock = false;
  })

  function getdata() {
    request('http://127.0.0.1:20005/api/v1/status', {json: true}, (error, res, body) => {
      try{
        if (error) {
          // console.error('error getting gpu - ' + error.message)
          setTimeout(getdata, 3000)
          return
        }
        let devices = [];

        body['miner']['devices'].forEach(gpu => {
          gpu_count += 1;
          let gpu_hashrate = calculateHashrate(gpu['hashrate_raw']);
          
          devices.push({'pcie': gpu['pci_bus_id'], 'name': gpu['info'], 'hashrate': gpu_hashrate, 'core-clock': gpu['core_clock'], 'fan': gpu['fan'], 'mem-clock': gpu['mem_clock'], 'power': gpu['power'], 'temperature': gpu['temperature']})
        })
        console.log('gpu count - ' + gpu_count)
        gpu_details = {'hashrate': '0 MH/s', 'power': '0 W', 'uptime': '00:00:00', 'devices': devices}

        mainWindow_tasks.push('send-gpu-data')
        killEngine2(nb_pid)
        BrowserWindow.fromId(loadingWindowId).webContents.send('close-loading')
      }catch(err){
        console.error('Error getting gpu details - ' + err.message)
      }
    })  
  }

  nb.on('spawn', ()=>{
    getdata()
  })

  // temporaly fix
  // run_lock = false;
}

// ------------------------------ UPDATE -----------------------------------
function checkPluginUpdates() {
  BrowserWindow.fromId(loadingWindowId).webContents.send("checking-for-plugin-updates")

  plugin_updating = true;
  let engines = ['nbminer', 'trex', 'gminer']
  let details = getMinerDetails();

  let check_update_link = 'https://minerhouse.lk/wp-content/uploads/updates.json';
  let options = {json: true};
  try{
    request(check_update_link, options, (error, res, body) => {    
      if (!error && res.statusCode == 200) {         
        for (let i = 0; i < 3; i++) {
          if (details[engines[i]]['version'] != body[engines[i]]['version']) {
            downloading_plugins.push(engines[i])
          }
        }
        if (downloading_plugins.length != 0) {
          mainWindow_tasks.push('download-plugins')
        }else{
          plugin_updating = false;
        }
      }else{
        return
      }
    });
  }catch(err){
    console.error('Download plugin failed.', err.message)
  }
}

function check_updates(do_download=false){
  if (!config_file['auto_update']) {
    return
  }
  if (!do_download) {
    BrowserWindow.fromId(loadingWindowId).webContents.send("checking-for-app-updates")
    console.log("Checking for updates")
  }
  let check_update_link = 'https://minerhouse.lk/wp-content/uploads/updates.json';
  let options = {json: true};
  try{
    request(check_update_link, options, (error, res, body) => {
      if (error) {
        return  
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
                  icon:'icon.png',
                  title: 'Update Downloaded.',
                  body: 'You need to manually run and install the setup located at ' + item.path
                }
                new Notification(notification).show()
              }
            }); 
          }else{
            BrowserWindow.fromId(loadingWindowId).webContents.send("updates-available")
            mainWindow_tasks.push('app-updates-available')
          }
        }
      }
    });
  }catch(err){
    console.error('Check for update failed', err.message)
  }
}

// --------------------------------------------------------------------
function createConfigurationWindow(ownerWindow){
  const configuration_window = new BrowserWindow({
      width: 450,
      height: 400,
      parent: ownerWindow, 
      modal: true,
      width: 500,
      height: 450,
      resizable: false,
      // minimizable: false,
      frame: false,
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
function mainWindowOnStartTasks() {
  if (mainWindow_tasks.includes('app-updates-available')) {
    BrowserWindow.fromId(mainWindowId).webContents.send("updates-available")
  }
  if (mainWindow_tasks.includes('download-plugins')) {
    downloadEngine('all')
  }
  if (mainWindow_tasks.includes('send-gpu-data')) {
    BrowserWindow.fromId(mainWindowId).webContents.send('plugin-status', gpu_details)
    BrowserWindow.fromId(mainWindowId).webContents.send('gpu-count', gpu_count)
  }

}

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
    loadingWindowId = loadingWindow.id;
    
    // loading functions
    check_updates()
    checkPluginUpdates()
    getGpuDetails()
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
      mainWindowOnStartTasks()
      AutoMine()
      // if (first_run) {
      //   createConfigurationWindow(BrowserWindow.fromId(mainWindowId))
      // }
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
      createWindow()
    } 
  })
})

if (process.platform === 'win32')
{
    app.setAppUserModelId(app.name)
}

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
   downloadEngine(engine_name); 
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

ipc.on('get-gpu-count', (event) => {
  app.getGPUInfo('complete').then(info => {
    // console.log(info['gpuDevice']);
    
    // let count = 0;


    // // event.sender.send('gpu-count', count)
    // console.log('GPU count - ' + count)
  })
})


ipc.on('show-notification', (event, args)=>{
  let mainWindow = BrowserWindow.fromId(mainWindowId);

  if (args['type'] == 'error') {
    dialog.showMessageBox(mainWindow, {'type': 'error', 'title': args['title'], 'message': args['message']});
  }else if (args['type'] == 'info') {
    dialog.showMessageBox(mainWindow, {'type': 'info', 'title': args['title'], 'message': args['message']});
  }
})

ipc.on("check-for-updates", check_updates);

ipc.on("download-updates", ()=>{check_updates(true)});


ipc.on("showConfigurationWindow", createConfigurationWindow);

ipc.on('send-notification', (event, args)=>{
  const notification = {
    icon:'icon.png',
    title: args['title'],
    body: args['message'],
  }
  new Notification(notification).show()
})