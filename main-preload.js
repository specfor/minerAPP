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
    checbox_mine = document.getElementById('check-run-engine');

    checbox_mine.addEventListener('click', function(){runMiner(checbox_mine)});

  });