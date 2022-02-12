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
    console.log(checkbox.checked)
    if (checkbox.checked) {
        console.log("Run miner")
        ipcRenderer.send("run-mining-engine");
    }else{
        console.log("Terminate miner")
        ipcRenderer.send("kill-mining-engine")
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
    let txt_algorithm = document.getElementById('algorithm');
    let txt_pool_address = document.getElementById('pool-address');
    let txt_server = document.getElementById('server');
    let txt_wallet_address = document.getElementById('wallet-address');
    let select_engine = document.getElementById('engine-select');
    let btn_save = document.getElementById('btn-settings-save');

    btn_save.addEventListener('click', ()=> {       
        if (isEmptyOrSpaces(txt_algorithm.value) || isEmptyOrSpaces(txt_pool_address.value) || isEmptyOrSpaces(txt_server.value) || isEmptyOrSpaces(txt_wallet_address.value)) {
            console.log("Fill all fields");
            alert('Complete all details.');
        }else{
            let algorithm = txt_algorithm.value;
            let pool_address = txt_pool_address.value;
            let server = txt_server.value;
            let wallet_address = txt_wallet_address.value;
            let engine = select_engine.value;


        }
        

    })

  });