console.log("asm")
// remote = require("electron").remote


// console.log(remote.getVersion())


    

window.addEventListener("load", (event) => {
    let statusDisplay = document.getElementById("loading_msg");
    
    // looking for internet connection
    statusDisplay.textContent = "Checking internet connectivity..."

    if (navigator.onLine) {
        statusDisplay.textContent = "You are online."
    } else{
        statusDisplay.textContent = "You are offline."
    }

    
    window.setTimeout(()=> {window.close()}, 3000)
  });