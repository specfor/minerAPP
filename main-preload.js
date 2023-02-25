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

window.addEventListener("load", (event) => {
    
});
