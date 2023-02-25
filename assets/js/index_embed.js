// Handling tabs

const tabs = document.getElementsByClassName("tabs");

// Default tab is home
var lastTabId = "home"

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tab.style.display = "block";
        document.getElementById(lastTabId).style.display = "none";
        lastTabId = tab.id;
    })
});