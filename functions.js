const { app } = require("electron");
console.log("started");
// Use this variable to set dashboard btn as the active sidebar button at app start.
// Later change the variable to the relavent class id when change the main content according to the button press.
let activeSideBarButtonId = "menu-dashboard-btn";

// Variables with main content areas relavent to left menubar buttons.
let btnDashboard = document.querySelector("#menu-dashboard-btn");
let btnUser = document.querySelector("#menu-user-btn");
let btnMessages = document.querySelector("#menu-messages-btn");
let btnAnalytics = document.querySelector("#menu-analytics-btn");
let btnFiles = document.querySelector("#menu-files-btn");
let btnOrders = document.querySelector("#menu-orders-btn");
let btnSave = document.querySelector("#menu-saved-btn");
let btnSettings = document.querySelector("#menu-settings-btn");
let btnLogOut = document.querySelector("#menu-log-out-btn");

// Main content areas for buttons
let dashboardSection = document.querySelector("#dashboard-area");

// change the active section to hidden.
function hideActiveArea() {
    activeElement = document.querySelector("#" + activeSideBarButtonId);
    activeElement.className = "static-section";
}

btnDashboard.addEventListener("click", ()=>{
    if (activeSideBarButtonId != "menu-dashboard-btn") {
        hideActiveArea();
        dashboardSection.className = "home-section";
    }
});

btnUser.addEventListener("click", ()=>{
    if (activeSideBarButtonId != "menu-user-btn") {
        hideActiveArea();
        dashboardSection.className = "home-section";
    }

});btnMessages.addEventListener("click", ()=>{
    if (activeSideBarButtonId != "menu-messages-btn") {
        hideActiveArea();
        dashboardSection.className = "home-section";
    }
});
btnAnalytics.addEventListener("click", ()=>{
    if (activeSideBarButtonId != "menu-analytics-btn") {
        hideActiveArea();
        dashboardSection.className = "home-section";
    }
});btnFiles.addEventListener("click", ()=>{
    if (activeSideBarButtonId != "menu-files-btn") {
        hideActiveArea();
        dashboardSection.className = "home-section";
    }
});btnOrders.addEventListener("click", ()=>{
    if (activeSideBarButtonId != "menu-orders-btn") {
        hideActiveArea();
        dashboardSection.className = "home-section";
    }
});btnSave.addEventListener("click", ()=>{
    if (activeSideBarButtonId != "menu-saved-btn") {
        hideActiveArea();
        dashboardSection.className = "home-section";
    }
});btnSettings.addEventListener("click", ()=>{
    if (activeSideBarButtonId != "menu-settings-btn") {
        hideActiveArea();
        dashboardSection.className = "home-section";
    }
});btnLogOut.addEventListener("click", ()=>{
    app.quit();
});