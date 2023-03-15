// Handling tabs

// set home tab to show
document.getElementById("home").style.display = "block";

const tabs = document.getElementsByClassName("tab");
const tabNavBtns = document.getElementsByClassName("nav-btn");
console.log(tabs.length);

// Default tab is home
let lastTabId = "home";

for (let index = 0; index < tabNavBtns.length; index++) {
    tabNavBtns.item(index).addEventListener("click", () => {
        let newSelectedTab = document.getElementById(
            tabNavBtns.item(index).id.substring(4)
        );
        let oldSelectedTab = document.getElementById(lastTabId);
        if (newSelectedTab === oldSelectedTab) {
            return;
        }
        newSelectedTab.style.display = "block";
        oldSelectedTab.style.display = "none";
        lastTabId = tabNavBtns.item(index).id.substring(4);
    });
}

// progress bar
const progressBar = document.getElementsByClassName("progress-bar")[0];
setInterval(() => {
    const computedStyle = getComputedStyle(progressBar);
    const width = parseFloat(computedStyle.getPropertyValue("--width")) || 0;
    progressBar.style.setProperty("--width", width + 0.1);
}, 5);
