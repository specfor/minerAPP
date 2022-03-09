const { isEmptyOrSpaces } = require('builder-util');
const { info } = require('console');
const { ipcRenderer, BrowserWindow, webContents } = require('electron');
const { request } = require('http');
const path = require('path')

var income = false;
var ready_to_mine = false;
var mining_status = false;
var just_started = true;
var downloading = false;
var gpu_details = {};
var selected_gpu_index = -1;

// ------------------------- Engine --------------------------
function setGUIState(mining) {
    let imageMiner = document.getElementById('img-mining');
    let imageMiner2 = document.getElementById('img-mining2');
    let status_mini = document.getElementById('status-mini');
    let status_mini_not = document.getElementById('stutus-mini-not-running');

    if (mining) {
        mining_status = true;
        imageMiner.style.opacity = '100%';
        imageMiner2.style.opacity = '0%';

        status_mini.style.opacity = '100%';
        status_mini_not.style.opacity = '0%';
    }else{
        mining_status = false;
        imageMiner.style.opacity = '0%';
        imageMiner2.style.opacity = '100%';

        status_mini.style.opacity = '0%';
        status_mini_not.style.opacity = '100%';

    }
}

function runMiner(){
    let checkbox = document.getElementById('check-run-engine');
    // let txt_status_pool_address = document.getElementById('status-pool-address');
    let coin = document.getElementById('run-coin').value;
    // console.log(coin + ' coin ');
    let plugin = document.getElementById('run-plugin').value;
    
    
    if (checkbox.checked) {
        console.log("Starting miner program");
        ipcRenderer.send("run-mining-engine", {plugin, coin});
        setGUIState(true);
    }else{
        console.log("Terminaing miner program");
        ipcRenderer.send("kill-mining-engine");
        setGUIState(false);
    }
}

function change_home_status(pool_address, algorithm, plugin_used){
    let coin = document.getElementById('run-coin');
    let plugin = document.getElementById('run-plugin');

    let txt_status_algoritm = document.getElementById('status-algorithm');
    let txt_status_server = document.getElementById('status-server');
    let txt_status_pool_address = document.getElementById('status-pool-address');
    if ((!mining_status || just_started) && !isEmptyOrSpaces(pool_address)) {
        // console.log("setting home screen statuses.")
        just_started = false;
        let server = pool_address.split('.');
        server = server[1] + '.' + server[2].split(':')[0];
        coin.value = algorithm;
        plugin.value = plugin_used;
        txt_status_algoritm.textContent = plugin_used.toUpperCase() + ' - ' + algorithm.toUpperCase();
        txt_status_pool_address.textContent = pool_address;
        txt_status_server.textContent = server;
    }
}

ipcRenderer.on('ready-to-mine', ()=>{
    ready_to_mine = true;
})

ipcRenderer.on('engine-download-started', () => {
    downloading = true;

    let down_bar = document.getElementById('down-bar');
    down_bar.style.opacity = '100%';

    let status_mini = document.getElementById('status-mini');
    let status_bar = document.getElementById('stutus-mini-not-running');
    if (mining_status) {
        status_mini.style.opacity = '0%';
    }else{
        status_bar.style.opacity = '0%';
    }
})

ipcRenderer.on('run-miner', ()=>{
    document.getElementById('check-run-engine').checked = true;
    setGUIState(true)
})

ipcRenderer.on('miner-stopped', ()=>{
    document.getElementById('check-run-engine').checked = false;
    setGUIState(false);

    let txt_mini_hashrate = document.getElementById('status-mini-hashrate');
    let txt_mini_power = document.getElementById('status-mini-power');
    let txt_status_hashrate = document.getElementById('status-hashrate');
    let txt_mini_uptime = document.getElementById('status-mini-uptime');

    txt_status_hashrate.textContent = '- MH/s';
    txt_mini_hashrate.textContent = '- MH/s';
    txt_mini_power.textContent =  '- W';
    txt_mini_uptime.textContent = '00:00:00';

    // stats page    
    gpu_details['coin'] = 'no-coin';
    gpu_details['hashrate'] = '- MH/s';

    let gpu_detail_container = document.getElementById('gpu-details-container');
    gpu_detail_container.innerHTML = '';

    for([gpu_id, gpu] of Object.entries(gpu_details)){
        if (gpu_id == 'coin' || gpu_id == 'hashrate') {
            continue
        }
        gpu_details[gpu_id]['fan'] = '-';
        gpu_details[gpu_id]['power'] = '-';
        gpu_details[gpu_id]['temperature'] = '-';

        let card = '<button class="card"><div class="data-line"><div class="id-s">ID:' + gpu['id'] +
        '</div><h6 id="big-font">'+ gpu['name'] +'</h6>' +
        '<div class="mini-bar"><div class="left-pa"><div class="deta"><h5>--</h5>' +
        '<H5>- MH/s</H5></div></div><div class="card-oc-info"><div class="oc-item">' +
        '<img src="./processer.png" alt="" width="15px" height="15px"><h6>'+ gpu['core-clock'] +
        '</h6></div><div class="oc-item"><img src="./ram.png" alt="" width="15px" height="15px">' +
        '<h6>'+ gpu['mem-clock'] +'</h6></div><div class="oc-item"><img src="./watt.png" alt="" width="20px" height="20px">' +
        '<h6>'+ gpu['power'] +'</h6></div><div class="oc-item"><img src="./fan.png" alt="" width="20px" height="20px">' +
        '<h6>'+ gpu['fan'] +'</h6></div><div class="oc-item"><img src="./temp.png" alt="" width="20px" height="20px">' +
        '<h6>'+ gpu['temperature'] +'</h6></div></div></div></div></button>';
        
        gpu_detail_container.innerHTML += card;
    }
})

ipcRenderer.on("engine-download-progress", (event, args) => {
    let down_progress = document.getElementById('download-progress');
    down_progress.style.width = args + '%';

    let down_bar_text = document.getElementById('down-bar-txt');
    down_bar_text.textContent = 'Download ' + args + '% completed.';
})

ipcRenderer.on("engine-download-complete", (event) => {
    downloading = false;
    
    let status_mini = document.getElementById('status-mini');
    let status_bar = document.getElementById('stutus-mini-not-running');
    if (mining_status) {
        status_mini.style.opacity = '100%';
    }else{
        status_bar.style.opacity = '100%';
    }

    let down_bar = document.getElementById('down-bar');
    down_bar.style.opacity = '0%';

    console.log('done donwloading');
})

ipcRenderer.on("update-download-complete", (event, path) => {
    let btn_info_update = document.getElementById('updater');
    btn_info_update.textContent = 'Download';

    let status_mini = document.getElementById('status-mini');
    let status_bar = document.getElementById('stutus-mini-not-running');
    if (mining_status) {
        status_mini.style.opacity = '100%';
    }else{
        status_bar.style.opacity = '100%';
    }

    let down_bar = document.getElementById('down-bar');
    down_bar.style.opacity = '0%';
    console.log('done donwloading update');
})

ipcRenderer.on('updates-available', ()=>{
    console.log("Updates available")
    let btn_update_available = document.getElementById('show-update');
    let info_no_update = document.getElementById('info-update-no');
    let info_update = document.getElementById('info-update');
    btn_update_available.style.opacity = '100%';
    info_update.style.opacity = '100%';
    info_no_update.style.opacity = '0%';

    let btn_info_update = document.getElementById('updater');
    btn_info_update.addEventListener('click', ()=>{
        ipcRenderer.send('download-updates');
        btn_info_update.textContent = 'Downloading';
    })

    let btn_main_update = document.getElementById("show-update");
    btn_main_update.addEventListener('click', ()=>{
        let tab_info = document.getElementById('tab-info');
        tab_info.click();
    })

})

ipcRenderer.on('plugin-status', (event, args)=>{
    let txt_mini_hashrate = document.getElementById('status-mini-hashrate');
    let txt_mini_power = document.getElementById('status-mini-power');
    let txt_status_hashrate = document.getElementById('status-hashrate');
    let txt_mini_uptime = document.getElementById('status-mini-uptime');

    txt_status_hashrate.textContent = args['hashrate'];
    txt_mini_hashrate.textContent = args['hashrate'];
    txt_mini_power.textContent = args['power'] + ' W';
    txt_mini_uptime.textContent = args['uptime'];

    // status page
    gpu_details = {};

    let gpu_detail_container = document.getElementById('gpu-details-container');

    gpu_detail_container.innerHTML = '';
    let coin = args['coin'];
    if (!coin) {
        coin = 'no-coin'
    }

    args['devices'].forEach(gpu => {
        let active = ''
        if (gpu['id'] == selected_gpu_index) {
            active = 'actives'
        }
        console.log(gpu)
        
        let card = '<button class="card"><div class="data-line"><div class="id-s">ID:' + gpu['id'] +
          '</div><h6 id="big-font">'+ gpu['name'] +'</h6>' +
          '<div class="mini-bar"><div class="left-pa"><div class="deta"><h5>'+coin +'</h5>' +
          '<H5>'+ args['hashrate'] +'</H5></div>' + 
          '</div><div class="card-oc-info"><div class="oc-item">' +
          '<img src="./processer.png" alt="" width="15px" height="15px"><h6>'+ gpu['core-clock'] +
          '</h6></div><div class="oc-item"><img src="./ram.png" alt="" width="15px" height="15px">' +
          '<h6>'+ gpu['mem-clock'] +'</h6></div><div class="oc-item"><img src="./watt.png" alt="" width="20px" height="20px">' +
          '<h6>'+ gpu['power'] +'</h6></div><div class="oc-item"><img src="./fan.png" alt="" width="20px" height="20px">' +
          '<h6>'+ gpu['fan'] +'</h6></div><div class="oc-item"><img src="./temp.png" alt="" width="20px" height="20px">' +
          '<h6>'+ gpu['temperature'] +'</h6></div></div></div></div></button>';

        gpu_detail_container.innerHTML += card;

        console.log('gpu - ' + gpu['id'])
        gpu_details['gpu' + gpu['id']] = gpu;
    });
    // console.log(gpu_details)
})

ipcRenderer.on('gpu-count', (event, args)=>{
    // console.log('gpu -' + args)
    let txt_status_gpu_count = document.getElementById('status-gpu-count');
    txt_status_gpu_count.textContent = args + ' GPUs';
})

ipcRenderer.on('current-mining-settings', (event, args)=>{

})

window.addEventListener("load", (event) => {
    let info_update = document.getElementById('info-update');
    info_update.style.opacity = '0%';
    let info_no_update = document.getElementById('info-update-no');
    info_no_update.style.opacity = '100%';

    // ------------------ RUN MINER -----------------
    let checbox_mine = document.getElementById('check-run-engine');
    checbox_mine.addEventListener('click', (event)=>{
        if (!downloading || !ready_to_mine) {
            runMiner()
        }else{
            event.preventDefault()
        }
    });

    // ------------------ SETTINGS AND MINER STATUS ------------------
    let select_engine = document.getElementById('engine-select');
    let txt_pool_address = document.getElementById('pool-address');
    let txt_wallet_address = document.getElementById('wallet-address');
    let select_coins = document.getElementById('select-coins');
    let txt_extra_param = document.getElementById('extra-param');
    
    let btn_save = document.getElementById('btn-settings-save');
    let btn_reset = document.getElementById('reset-icon');

    let check_auto_run_ = document.getElementById('checkbox-auto-run');
    let check_auto_mine_ = document.getElementById('checkbox-auto-mine');

    check_auto_mine_.addEventListener('change', ()=>{
        if (check_auto_mine_.checked) {
            check_auto_run_.checked = true;
        }
    })

    check_auto_run_.addEventListener('change', ()=>{
        if (check_auto_mine_.checked) {
            alert('You can\'t uncheck "Run on statup" when set to "Auto run mining program with configured settings at computer power up" option checked')
            check_auto_run_.checked = true;
        }
    })

    btn_reset.addEventListener('click', ()=>{
        let engine = select_engine.value;
        txt_pool_address.value = '';
        txt_wallet_address.value = '';
        txt_extra_param.value = '';
        select_coins.value = 'no_coin_selected';
        ipcRenderer.send("reset-engine-config", {engine});
    })
    
    btn_save.addEventListener('click', ()=> {
        let check_auto_update = document.getElementById('checkbox-auto-update').checked;
        let check_auto_run = document.getElementById('checkbox-auto-run').checked;
        let check_gpu_check = document.getElementById('checkbox-gpu-fail-check').checked;
        let check_auto_mine = document.getElementById('checkbox-auto-mine').checked;
        let check_resolve_internet = document.getElementById('checkbox-resolve-internet').checked;
        let check_fix_common_err = document.getElementById('checkbox-fix-common-errors').checked;
    
        ipcRenderer.send("save-app-config", {check_auto_update, check_auto_run, check_gpu_check, check_auto_mine, check_resolve_internet, check_fix_common_err});
           
        if (isEmptyOrSpaces(select_coins.value) || isEmptyOrSpaces(txt_pool_address.value)  || isEmptyOrSpaces(txt_wallet_address.value) || select_coins.value == 'no_coin_selected') {
            console.log("Fill all fields");
            ipcRenderer.send('show-notification', {'type': 'error', 'title': 'Input Error', 'message': 'Fill all required fields.'})
        }else{
            let engine = select_engine.value;
            let pool_address = txt_pool_address.value;
            let wallet_address = txt_wallet_address.value;
            let coin = select_coins.value;
            let extra_param = txt_extra_param.value;

            if (pool_address.split('.').length > 2) {
                ipcRenderer.send("save-engine-config", {engine, pool_address, wallet_address, coin, extra_param});
            }else{
            ipcRenderer.send('show-notification', {'type': 'error', 'title': 'Input Error', 'message': 'Pool address is invalid.'})
                
            }
        }

        setTimeout(() => {btn_save.classList.toggle('button--loading')}, 1000);
    })

    ipcRenderer.on('engine-config', (event, data) => {
        console.log('plugin configuration received.');

        select_engine.value = data['selected'];

        let coins = data[select_engine.value]['supported_coins'];
        select_coins.innerHTML = '<option class="coin-style" value="no_coin_selected">Select Coin</option>';
        coins.forEach(coin => {
            let sel_option = '<option class="coin-style" value="'+ coin +'">'+ coin.toUpperCase() +'</option>'
            select_coins.innerHTML = select_coins.innerHTML + sel_option;
        });

        txt_pool_address.value = data[select_engine.value]['pool_address'];
        txt_wallet_address.value = data[select_engine.value]['wallet_address'];
        select_coins.value = data[select_engine.value]['selected_coin'];
        txt_extra_param.value = data[select_engine.value]['extra_param'];
        change_home_status(data[select_engine.value]['pool_address'], data[select_engine.value]['selected_coin'], data['selected']);

        select_engine.addEventListener('change',(event) => {
            let coins = data[select_engine.value]['supported_coins'];
            select_coins.innerHTML = '<option class="coin-style" value="no_coin_selected">Select Coin</option>';
            coins.forEach(coin => {
                let sel_option = '<option class="coin-style" value="'+ coin +'">'+ coin.toUpperCase() +'</option>'
                select_coins.innerHTML = select_coins.innerHTML + sel_option;
            });
            change_home_status(data[select_engine.value]['pool_address'], data[select_engine.value]['selected_coin'], select_engine.value);
            txt_pool_address.value = data[select_engine.value]['pool_address'];
            txt_wallet_address.value = data[select_engine.value]['wallet_address'];
            select_coins.value = data[select_engine.value]['selected_coin'];
            txt_extra_param.value = data[select_engine.value]['extra_param'];
        })
    })

    ipcRenderer.on('app-config', (event, args)=>{
        document.getElementById('checkbox-auto-update').checked = args['auto_update'];
        document.getElementById('checkbox-auto-run').checked = args['auto_run'];
        document.getElementById('checkbox-gpu-fail-check').checked = args['gpu_check'];
        document.getElementById('checkbox-auto-mine').checked = args['auto_mine'];
        document.getElementById('checkbox-resolve-internet').checked = args['resolve_internet'];
        document.getElementById('checkbox-fix-common-errors').checked = args['resolve_common_err'];
    })


    ipcRenderer.send('get-engine-config');
    ipcRenderer.send('get-app-config');

    // ------------------------------------------------------------------
    let mail = document.getElementById('btn-copy-mail');
    let btc_addr = document.getElementById('btn-copy-btc-address');

    mail.addEventListener('click', ()=>{
        navigator.clipboard.writeText('wenujasl@gmail.com');
        ipcRenderer.send('send-notification', {"title": "Email copied", "message": "Email copied to clipboard."})
    })

    btc_addr.addEventListener('click', ()=>{
        navigator.clipboard.writeText('1Dv39qrJu6wtvEzAZkNLoeFdzLkfVJZtPp');
        ipcRenderer.send('send-notification', {"title": "BTC wallet address copied", "message": "BTC wallet address copied to clipboard."})
    })
    
    // --------------------- DASHBOARD TAB WIDGET --------------------------------
    let widget_area = document.getElementById('widget-coin-area')
    let select_widget_coin = document.getElementById('widget-coin')
    let select_widget_coin_metric = document.getElementById('widget-hash-metric')

    let widget_coins = {'ETH': 'Ethash', 'FIRO': 'FiroPoW', 'BTC': 'SHA-256', 'VEIL': 'SHA-256', 'DOGE': 'Scrypt'}
    let metric = select_widget_coin_metric.value;

    for (const [coin_name, algorithm] of Object.entries(widget_coins)) {
        let option = '<option value="'+ coin_name +'">'+ coin_name +'</option>'
        select_widget_coin.innerHTML += option;
    }

    function changeWidgetCoin() {
        let coin = select_widget_coin.value
        console.log(coin)
        let d = '<a class="minerstat-widget" title="'+ coin +' mining calculator" data-coin="'+ coin +
                '" data-algo="'+ widget_coins[coin] +'" data-info="yes" data-style="dark" data-color=""' +
                'data-unit="'+ metric +'" data-hashrate="100" data-width="300" rel="nofollow"' + 
                'href="https://minerstat.com/coin/'+ coin +'">'+ coin +' mining calculator</a><script async src="https://api.minerstat.com/v2/widgets/coin.js" charset="utf-8"></script>'
        document.getElementById('widget-coins').src = "data:text/html;charset=utf-8," + escape(d);
    
    }

    changeWidgetCoin()

    select_widget_coin.addEventListener('change', changeWidgetCoin)

    select_widget_coin_metric.addEventListener('change', ()=>{
        metric = select_widget_coin_metric.value
        changeWidgetCoin()
    })
    
    // ------------------ DASHBOARD POOL STATUS ----------------------------------
    let webview_dashboard = document.getElementById('pool-dashboard')

    let btn_minerpool = document.getElementById('pool-minerpool')
    let btn_2miner = document.getElementById('pool-2miners')

    function loadPoolDashboard(poolname) {
        if (!mining_status) {
            ipcRenderer.send('show-notification', {'type': 'error', 'title': 'Not In Mining', 'message': 'Click on the relavent miner pool after starting to mine.'})
            return
        }

        if (poolname == 'minerpool') {
            
        }

    }

    btn_2miner.addEventListener('click', ()=>{loadPoolDashboard('2miner')})
    btn_minerpool.addEventListener('click', ()=>{loadPoolDashboard('minerpool')})

    // ------------------INTERNET CONNECTIVITY -------------------------------------
    setInterval(()=>{
        let internet = document.getElementById('wifi_badge');
        if (navigator.onLine) {
            internet.style.color = '#333333';
        }else{
            internet.style.color = 'red';
        }
    }, 2000)
});