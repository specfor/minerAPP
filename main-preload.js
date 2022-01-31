const { ipcRenderer, BrowserWindow } = require('electron')

function setupAutoStart(){
    ipcRenderer.on('autoStartReply', (event, arg) => {
    console.log("auto start" + arg)
    })
    ipcRenderer.send('setAutoStart', 'ping')
}

// function createConfigurationWindow(){
//     const configuration_window = new BrowserWindow({
//         parent: top, 
//         modal: true,
//         width: 450,
//         height: 300,
//         resizable: false,
//         minimizable: false,
//         frame: false,
//         show: false,

//         // webPreferences: {
//         //   preload: path.join(__dirname, 'loading.js')
//         // }
//     })

//     configuration_window.loadFile('pop-up-configuration.html')
//     configuration_window.setMenu(null)
//     configuration_window.show()


//     configuration_window.webContents.openDevTools()
// }

window.addEventListener("load", (event) => {
    // ------------------ AUTO START -------------------
    let btn_auto_start = document.getElementById('click')

    btn_auto_start.addEventListener("click", ()=>{
        setupAutoStart()
    });

    // ------------------ CONFIGURATION WINDOW ------------------
    let btn_configuration = document.getElementById('btn-configuration')

    btn_configuration.addEventListener("click", ()=>{
        // createConfigurationWindow()
    });
  });