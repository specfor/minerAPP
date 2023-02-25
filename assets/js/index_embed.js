// Handling tabs

// set home tab to show
document.getElementById('home').style.display = "block";

const tabs = document.getElementsByClassName("tab");
const tabNavBtns = document.getElementsByClassName("nav-btn");
console.log(tabs.length);

// Default tab is home
var lastTabId = "home";

for (let index = 0; index < tabNavBtns.length; index++) {
    tabNavBtns.item(index).addEventListener("click", ()=>{
        var newSelectedTab = document.getElementById(tabNavBtns.item(index).id.substring(4));
        var oldSelectedTab = document.getElementById(lastTabId);
        if (newSelectedTab == oldSelectedTab) {
            return
        }
        newSelectedTab.style.display = "block";
        oldSelectedTab.style.display = "none";
        lastTabId = tabNavBtns.item(index).id.substring(4);
    })    
}
