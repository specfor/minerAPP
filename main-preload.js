const { isEmptyOrSpaces } = require('builder-util')
const { ipcRenderer, BrowserWindow } = require('electron')
const path = require('path')


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
    console.log(checkbox.checked);
    let imageMiner = document.getElementById('img-mining');
    let imageMiner2 = document.getElementById('img-mining2');

    if (checkbox.checked) {
        console.log("Run miner")
        ipcRenderer.send("run-mining-engine");
        imageMiner.style.opacity = '100%';
        imageMiner2.style.opacity = '0%';
    }else{
        console.log("Terminate miner")
        ipcRenderer.send("kill-mining-engine")
        imageMiner.style.opacity = '0%';
        imageMiner2.style.opacity = '100%';
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

    // ------------------ SETTINGS ------------------
    let select_engine = document.getElementById('engine-select');
    let txt_pool_address = document.getElementById('pool-address');
    let txt_wallet_address = document.getElementById('wallet-address');
    let txt_algorithm = document.getElementById('algorithm');
    let txt_extra_param = document.getElementById('extra-param');
    let btn_save = document.getElementById('btn-settings-save');
    
    btn_save.addEventListener('click', ()=> {       
        if (isEmptyOrSpaces(txt_algorithm.value) || isEmptyOrSpaces(txt_pool_address.value) || isEmptyOrSpaces(txt_extra_param.value) || isEmptyOrSpaces(txt_wallet_address.value)) {
            console.log("Fill all fields");
            alert('Complete all details.');
        }else{
            let engine = select_engine.value;
            let pool_address = txt_pool_address.value;
            let wallet_address = txt_wallet_address.value;
            let algorithm = txt_algorithm.value;
            let extra_param = txt_extra_param.value;

            ipcRenderer.send("save-engine-config", {engine, pool_address, wallet_address, algorithm, extra_param});

        }

        setTimeout(() => {btn_save.classList.toggle('button--loading')}, 1000);
    })

    ipcRenderer.on('engine-config', (event, data) => {
        console.log('engine configuration received.')
        select_engine.value = data['selected'];
        txt_pool_address.value = data[select_engine.value]['pool_address'];
        txt_wallet_address.value = data[select_engine.value]['wallet_address'];
        txt_algorithm.value = data[select_engine.value]['algorithm'];
        txt_extra_param.value = data[select_engine.value]['extra_param'];

        select_engine.addEventListener('change',(event) => {
            txt_pool_address.value = data[select_engine.value]['pool_address'];
            txt_wallet_address.value = data[select_engine.value]['wallet_address'];
            txt_algorithm.value = data[select_engine.value]['algorithm'];
            txt_extra_param.value = data[select_engine.value]['extra_param'];
        })
    })

    ipcRenderer.send('get-engine-config');
  });