function setUpdateMode(updateMode = true) {
    let NormalInterface = document.getElementsByClassName("default-view")[0];
    let UpdateInterface = document.getElementsByClassName("update-view")[0];
    let MenuBar = document.getElementsByClassName("menu-section")[0];
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
    let coinSelectionMenu = document.getElementById("coinSelector");
    let coins = ["Hybrid", "Rvn", "Eth", "Kaspa", "CCX", "FLUX"];

    coins.forEach(coin => {
        let option;
        if (coins.indexOf(coin) === defaultCoinIndex) {
            option = document.createElement("option", "slected disabled");
        } else {
            option = document.createElement("option");
        }
        let text = document.createTextNode(coin);
        option.appendChild(text);
        coinSelectionMenu.appendChild(option)
    });

}

function setPluginsForSelection(defaultPluginIndex = 0) {
    let pluginSelectionMenu = document.getElementById("pluginSelector");
    let plugins = ["NBminer", "T rex", "TTMINER", "CC MINER", "LOL MINER"];

    plugins.forEach(plugin => {
        let option;
        if (plugins.indexOf(plugin) === defaultPluginIndex) {
            option = document.createElement("option", "selected disabled");
        } else {
            option = document.createElement("option");
        }
        let text = document.createTextNode(plugin);
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
