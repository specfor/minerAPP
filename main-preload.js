const { ipcRenderer, BrowserWindow } = require('electron')
const path = require('path')

function setupAutoStart(){
    ipcRenderer.on('autoStartReply', (event, arg) => {
    console.log("auto start" + arg)
    })
    ipcRenderer.send('setAutoStart', 'ping')
}

function downloadEngine(){
    ipcRenderer.send('downloadEngine', {payload : {url, properties: {}}})
}


ipcRenderer.on("engine-download-progress", (event, args) => {
    const progress = args[0];
    // set progress in progress bar
})

ipcRenderer.on("engine-download-complete", (event, args) => {
    const progress = args[0];
    // set progress in progress bar
})

window.addEventListener("load", (event) => {
    // ------------------ AUTO START -------------------
    let btn_auto_start = document.getElementById('click')

    btn_auto_start.addEventListener("click", ()=>{
        setupAutoStart()
    });

    // ------------------ CONFIGURATION WINDOW ------------------
    let btn_configuration = document.getElementById('btn-configuration')

    btn_configuration.addEventListener("click", ()=>{
        ipcRenderer.send("showConfigurationWindow")
    });
  });