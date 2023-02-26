async function downloadPlugin(event, { payload }) {
    let properties = payload.properties ? { ...payload.properties } : {};
    // download folder
    const download_path = path.join(__dirname, "");
    const download_url = "";

    await download(BrowserWindow.getFocusedWindow(), download_url, {
        ...properties,
        onProgress: (progress) => {
            mainWindow.webContents.send("engine-download-progress", progress);
        },
        onCompleted: (item) => {
            mainWindow.webContents.send("engine-download-complete", item);
        },
    });
}
