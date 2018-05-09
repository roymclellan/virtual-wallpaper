const electron = require('electron');
const { ipcRenderer, app, dialog, remote } = electron;

ipcRenderer.on('showPath', (e, args) => {
    console.log(args);
    document.getElementById('pathLabel').innerHTML = args;
    document.getElementById('submitButton').disabled = false;
})

document.getElementById('folderPickerButton').onclick = () => {
    console.log("clicky");
    ipcRenderer.send('getPath');
}

document.getElementById('submitButton').onclick = () => {
    let dropdown = document.querySelector('#windowsSelect')
    let count = dropdown.options[dropdown.selectedIndex].value;

    let timeSelect = document.getElementById('timeSelect');
    let time = timeSelect.options[timeSelect.selectedIndex].value;

    let payload = {
        count,
        time
    }
    
    ipcRenderer.send('showWindows', payload);
};

if(document.getElementById('pathLabel').innerHTML == ''){
    document.getElementById('submitButton').disabled = true;
}