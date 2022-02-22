const { isEmptyOrSpaces } = require('builder-util')
const { ipcRenderer, BrowserWindow } = require('electron')
const path = require('path')

var mining_status = false;

// ------------------------- Engine --------------------------

function runMiner(){
    let checkbox = document.getElementById('check-run-engine');
    // console.log(checkbox.checked);
    let txt_status_pool_address = document.getElementById('status-pool-address');
    let coin = document.getElementById('run-coin').value;
    // console.log(coin + ' coin ');
    let plugin = document.getElementById('run-plugin').value;
    
    let imageMiner = document.getElementById('img-mining');
    let imageMiner2 = document.getElementById('img-mining2');
    
    if (checkbox.checked) {
        console.log("Starting miner program")
        ipcRenderer.send("run-mining-engine", {plugin, coin});
        mining_status = true;
        imageMiner.style.opacity = '100%';
        imageMiner2.style.opacity = '0%';
    }else{
        console.log("Terminaing miner program")
        ipcRenderer.send("kill-mining-engine")
        mining_status = false;
        imageMiner.style.opacity = '0%';
        imageMiner2.style.opacity = '100%';
    }
}

function change_home_status(pool_address, algorithm, plugin_used){
    let coin = document.getElementById('run-coin');
    let plugin = document.getElementById('run-plugin');

    // let txt_status_hahsrate = document.getElementById('status-hashrate');
    let txt_status_algoritm = document.getElementById('status-algorithm');
    let txt_status_server = document.getElementById('status-server');
    let txt_status_pool_address = document.getElementById('status-pool-address');
    if (!mining_status && !isEmptyOrSpaces(pool_address)) {
        // console.log("setting home screen statuses.")
        let server = pool_address.split('.');
        server = server[1] + '.' + server[2].split(':')[0];
        coin.value = algorithm;
        plugin.value = plugin_used;
        txt_status_algoritm.textContent = plugin_used.toUpperCase() + ' - ' + algorithm.toUpperCase();
        txt_status_pool_address.textContent = pool_address;
        txt_status_server.textContent = server;
    }
}

ipcRenderer.on('engine-download-started', () => {
    let down_bar = document.getElementById('down-bar');
    down_bar.style.opacity = '100%';

    let status_bar = document.getElementById('status-panel');
    status_bar.style.opacity = '0%';
})

ipcRenderer.on('run-miner', ()=>{
    document.getElementById('check-run-engine').checked = true;
    runMiner()
})

ipcRenderer.on('miner-stopped', ()=>{
    document.getElementById('check-run-engine').checked = false;
})

ipcRenderer.on("engine-download-progress", (event, args) => {
    let down_progress = document.getElementById('download-progress');
    down_progress.style.width = args + '%';

    let down_bar_text = document.getElementById('down-bar-txt');
    down_bar_text.textContent = 'Download ' + args + '% completed.';
})

ipcRenderer.on("engine-download-complete", (event) => {
    let status_bar = document.getElementById('status-panel');
    status_bar.style.opacity = '100%';

    let down_bar = document.getElementById('down-bar');
    down_bar.style.opacity = '0%';

    console.log('done donwloading');
})

ipcRenderer.on("update-download-complete", (event, path) => {
    let btn_info_update = document.getElementById('updater');
    btn_info_update.textContent = 'Download';

    let status_bar = document.getElementById('status-panel');
    status_bar.style.opacity = '100%';

    let down_bar = document.getElementById('down-bar');
    down_bar.style.opacity = '0%';
    console.log('done donwloading update');
})

ipcRenderer.on('updates-available', ()=>{
    console.log("Updates available")
    let btn_update_available = document.getElementById('show-update');
    let info_update = document.getElementById('info-update');
    btn_update_available.style.opacity = '100%';
    info_update.style.opacity = '100%';

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


window.addEventListener("load", (event) => {
    // ------------------ RUN MINER -----------------
    let checbox_mine = document.getElementById('check-run-engine');
    checbox_mine.addEventListener('click', function(){runMiner()});

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
            alert('Complete all details.');
        }else{
            let engine = select_engine.value;
            let pool_address = txt_pool_address.value;
            let wallet_address = txt_wallet_address.value;
            let coin = select_coins.value;
            let extra_param = txt_extra_param.value;

            ipcRenderer.send("save-engine-config", {engine, pool_address, wallet_address, coin, extra_param});

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

    ipcRenderer.on('gpu-count', (event, args)=>{
        let txt_status_gpu_count = document.getElementById('status-gpu-count');
        txt_status_gpu_count.textContent = args + ' GPUs';
    })

    ipcRenderer.send('get-gpu-count');
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
    
});