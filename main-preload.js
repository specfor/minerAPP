console.log("goijggo")
const { ipcRenderer } = require('electron')

function setupAutoStart(){
    ipcRenderer.on('autoStartReply', (event, arg) => {
    console.log("auto start" + arg)
    })
    ipcRenderer.send('setAutoStart', 'ping')
}

window.addEventListener("load", (event) => {
    let btn_auto_start = document.getElementById('click')

    btn_auto_start.addEventListener("click", ()=>{
        setupAutoStart()
    });
  });