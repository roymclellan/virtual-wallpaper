const { ipcRenderer } = require('electron');

ipcRenderer.on('updateProgress', (event, progress) => {
    document.getElementById('loader').style.width = `${progress}%`;
});
