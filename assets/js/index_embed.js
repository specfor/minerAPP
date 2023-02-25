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
        document.getElementById(tabNavBtns.item(index).id.substr(4)).style.display = "block";
        document.getElementById(lastTabId).style.display = "none";
        lastTabId = tabNavBtns.item(index).id.substr(4);
    })    
}
