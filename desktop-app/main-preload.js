function setUpdateMode(updateMode = true) {
    NormalInterface = document.getElementsByClassName("default-view")[0];
    UpdateInterface = document.getElementsByClassName("update-view")[0];
    MenuBar = document.getElementsByClassName("menu-section")[0];
    if (updateMode) {
        MenuBar.style.visibility = "hidden";
        UpdateInterface.style.display = "block";
        NormalInterface.style.display = "none";
    } else {
        MenuBar.style.visibility = "visible";
        NormalInterface.style.display = "block";
        UpdateInterface.style.display = "none";
    }
}

function setCoinsForSelection(defaultCoinIndex = 0) {
    coinSelectionMenu = document.getElementById("coinSelector");
    coins = ["Hybrid", "Rvn", "Eth", "Kaspa", "CCX", "FLUX"];

    coins.forEach(coin => {
        if (coins.indexOf(coin) == defaultCoinIndex) {
            var option = document.createElement("option", "slected disabled")
        }else{
            var option = document.createElement("option")
        }
        var text = document.createTextNode(coin);
        option.appendChild(text);
        coinSelectionMenu.appendChild(option)
    });

}

function setPluginsForSelection(defaultPluginIndex = 0){
    pluginSelectionMenu = document.getElementById("pluginSelector");
    plugins = ["NBminer", "T rex", "TTMINER", "CC MINER", "LOL MINER"];

    plugins.forEach(plugin => {
        if (plugins.indexOf(plugin) == defaultPluginIndex) {
            var option = document.createElement("option", "slected disabled")
        }else{
            var option = document.createElement("option")
        }
        var text = document.createTextNode(plugin);
        option.appendChild(text);
        pluginSelectionMenu.appendChild(option)
    });
}




function init(params) {
    setCoinsForSelection();
    setPluginsForSelection();
}

window.addEventListener("load", (event) => {
    init();
});
