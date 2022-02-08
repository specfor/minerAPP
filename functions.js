// -------------------- LEFT MENU BAR HANDLING --------------------

// Use this variable to set dashboard btn as the active sidebar button at app start.
// Later change the variable to the relavent class id when change the main content according to the button press.
// let activeSideBarButtonId = "menu-dashboard-btn";
// let activeBodyAreaId = "dashboard-area";

// Main content areas for buttons
// let dashboardSection = document.getElementById("dashboard-area");

// Variables with main content areas relavent to left menubar buttons.
// let btnDashboard = document.getElementById("menu-dashboard-btn");
// let btnUser = document.getElementById("menu-user-btn");
// let btnMessages = document.getElementById("menu-messages-btn");
// let btnAnalytics = document.getElementById("menu-analytics-btn");
// let btnFiles = document.getElementById("menu-files-btn");
// let btnOrders = document.getElementById("menu-orders-btn");
// let btnSave = document.getElementById("menu-saved-btn");
// let btnSettings = document.getElementById("menu-settings-btn");
// let btnLogOut = document.getElementById("menu-log-out-btn");


// change the active section to hidden.
// function hideActiveArea() {
//     activeElement = document.getElementById(activeBodyAreaId);
//     activeElement.classList.toggle("hider");
// }

// function showElement(id) {
//     element = document.getElementById(id);
//     element.classList.toggle("hider")
//     activeBodyAreaId = id;
//     idSplit = id.split("-");
//     activeSideBarButtonId = "menu-" + idSplit[0] + "-btn";
// }

// btnDashboard.addEventListener("click", ()=>{
//     if (activeSideBarButtonId != "menu-dashboard-btn") {
//         hideActiveArea();
//         showElement("dashboard-area")
//     }
// });

// btnUser.addEventListener("click", ()=>{
//     if (activeSideBarButtonId != "menu-user-btn") {
//         hideActiveArea();
//         showElement("user-area")
//     }

// });

// btnMessages.addEventListener("click", ()=>{
//     if (activeSideBarButtonId != "menu-messages-btn") {
//         hideActiveArea();
//         showElement("messages-area")
//     }
// });

// btnAnalytics.addEventListener("click", ()=>{
//     if (activeSideBarButtonId != "menu-analytics-btn") {
//         hideActiveArea();
//         showElement("analytics-area")
//     }
// });

// btnFiles.addEventListener("click", ()=>{
//     if (activeSideBarButtonId != "menu-files-btn") {
//         hideActiveArea();
//         showElement("files-area")
//     }
// });

// btnOrders.addEventListener("click", ()=>{
//     if (activeSideBarButtonId != "menu-orders-btn") {
//         hideActiveArea();
//         showElement("orders-area")
//     }
// });

// btnSave.addEventListener("click", ()=>{
//     if (activeSideBarButtonId != "menu-saved-btn") {
//         hideActiveArea();
//         showElement("saved-area")
//     }
// });

// btnSettings.addEventListener("click", ()=>{
//     if (activeSideBarButtonId != "menu-settings-btn") {
//         hideActiveArea();
//         showElement("settings-area")
//     }
// });

// btnLogOut.addEventListener("click", ()=>{
//     app.quit();
// });




// -------------------- NETWORK STATUS --------------------
// let lbl_network_status = document.getElementById("home-internet-status")

// function getNetworkStatus() {
//     if (navigator.onLine) {
//         lbl_network_status.textContent = "ONLINE"
//     }else{
//         lbl_network_status.textContent = "OFFLINE"
//     }
// }

// getNetworkStatus()
// setInterval(getNetworkStatus, 5000)