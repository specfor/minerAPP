const { ipcRenderer } = require('electron')


window.addEventListener("load", (event) => {
    let statusDisplay = document.getElementById("loading_msg");
    
    // looking for internet connection
    statusDisplay.textContent = "Checking internet connectivity..."

    if (navigator.onLine) {
        statusDisplay.textContent = "You are online."
    } else{
        statusDisplay.textContent = "You are offline."
    }

    ipcRenderer.on('checking-for-app-updates', ()=>{
        statusDisplay.textContent = 'Checking for updates...'
    })
    
    ipcRenderer.on('updates-available', ()=>{
        statusDisplay.textContent = 'Updates available for application.'
    })

    ipcRenderer.on('checking-for-plugin-updates', ()=>{
        statusDisplay.textContent = 'Checking for plugin updates...'
    })
    
    ipcRenderer.on('checking-gpu-data', ()=>{
        statusDisplay.textContent = 'Gathering gpu details...'
    })


    window.setTimeout(()=> {window.close()}, 5000)
  });