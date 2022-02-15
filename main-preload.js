const { isEmptyOrSpaces } = require('builder-util')
const { ipcRenderer, BrowserWindow } = require('electron')
const path = require('path')

var mining_status = false;

function setupAutoStart(){
    ipcRenderer.on('autoStartReply', (event, arg) => {
    console.log("auto start" + arg)
    })
    ipcRenderer.send('setAutoStart', 'ping')
}

// ------------------------- Engine --------------------------
function downloadEngine(){
    ipcRenderer.send('downloadEngine', {payload : {properties: {}}})
}

function runMiner(checkbox){
    // console.log(checkbox.checked);
    let imageMiner = document.getElementById('img-mining');
    let imageMiner2 = document.getElementById('img-mining2');

    if (checkbox.checked) {
        console.log("Starting miner program")
        ipcRenderer.send("run-mining-engine");
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

function change_home_status(pool_address, algorithm){
    let txt_status_gpu_count = document.getElementById('status-gpu-count');
    let txt_status_hahsrate = document.getElementById('status-hashrate');
    let txt_status_algoritm = document.getElementById('status-algorithm');
    let txt_status_server = document.getElementById('status-server');
    let txt_status_pool_address = document.getElementById('status-pool-address');
    if (!mining_status && !isEmptyOrSpaces(pool_address)) {
        // console.log("setting home screen statuses.")
        let server = pool_address.split('.');
        server = server[1] + '.' + server[2].split(':')[0];
        txt_status_algoritm.textContent = algorithm;
        txt_status_pool_address.textContent = pool_address;
        txt_status_server.textContent = server;
    }
}

ipcRenderer.on("engine-download-progress", (event, args) => {
    const progress = args;
    console.log(progress);
    // set progress in progress bar
})

ipcRenderer.on("engine-download-complete", (event, args) => {
    const progress = args[0];
    console.log('done donwloading');
})

window.addEventListener("load", (event) => {
    // ------------------ AUTO START -------------------
    // let btn_auto_start = document.getElementById('click')

    // btn_auto_start.addEventListener("click", ()=>{
    //     setupAutoStart()
    // });

    // ------------------ CONFIGURATION WINDOW ------------------
    // let btn_configuration = document.getElementById('btn-configuration')

    // btn_configuration.addEventListener("click", ()=>{
    //     ipcRenderer.send("showConfigurationWindow")
    // });

    // downloadEngine()

    // ------------------ RUN MINER -----------------
    let checbox_mine = document.getElementById('check-run-engine');

    checbox_mine.addEventListener('click', function(){runMiner(checbox_mine)});

    // ------------------ SETTINGS AND MINER STATUS ------------------
    let select_engine = document.getElementById('engine-select');
    let txt_pool_address = document.getElementById('pool-address');
    let txt_wallet_address = document.getElementById('wallet-address');
    let select_coins = document.getElementById('select-coins');
    let txt_extra_param = document.getElementById('extra-param');
    let btn_save = document.getElementById('btn-settings-save');
    let btn_reset = document.getElementById('reset-icon');


    btn_reset.addEventListener('click', ()=>{
        let engine = select_engine.value;
        txt_pool_address.value = '';
        txt_wallet_address.value = '';
        txt_extra_param.value = '';
        select_coins.value = 'no_coin_selected';
        ipcRenderer.send("reset-engine-config", {engine});
    })
    
    btn_save.addEventListener('click', ()=> {       
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
        console.log('engine configuration received.');

        let coins = data[select_engine.value]['supported_coins'];
        select_coins.innerHTML = '<option class="coin-style" value="no_coin_selected">Select Coin</option>';
        coins.forEach(coin => {
            let sel_option = '<option class="coin-style" value="'+ coin +'">'+ coin +'</option>'
            select_coins.innerHTML = select_coins.innerHTML + sel_option;
        });

        select_engine.value = data['selected'];
        txt_pool_address.value = data[select_engine.value]['pool_address'];
        txt_wallet_address.value = data[select_engine.value]['wallet_address'];
        select_coins.value = data[select_engine.value]['selected_coin'];
        txt_extra_param.value = data[select_engine.value]['extra_param'];
        change_home_status(data[select_engine.value]['pool_address'], data[select_engine.value]['selected_coin']);

        select_engine.addEventListener('change',(event) => {
            change_home_status(data[select_engine.value]['pool_address'], data[select_engine.value]['selected_coin']);
            txt_pool_address.value = data[select_engine.value]['pool_address'];
            txt_wallet_address.value = data[select_engine.value]['wallet_address'];
            select_coins.value = data[select_engine.value]['selected_coin'];
            txt_extra_param.value = data[select_engine.value]['extra_param'];
        })
    })

    ipcRenderer.send('get-engine-config');

    // ------------------------------------------------------------------
   
});