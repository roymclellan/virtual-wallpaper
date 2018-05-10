const electron = require('electron');
const { ipcRenderer, app, dialog, remote } = electron;

ipcRenderer.on('showPath', (e, args) => {
    console.log(args);
    document.getElementById('pathLabel').innerHTML = args;
    document.getElementById('submitButton').disabled = false;
});

ipcRenderer.on('message', (event, text)  => {
    console.log('Message Recieved: ' + message);
    var container = document.getElementById('messages');
    var message = document.createElement('div');
    message.innerHTML = text;
    container.appendChild(message);
});


ipcRenderer.on('setVersion', (e, version) => {
    console.log('Version: ' + version);
    document.getElementById('versionLabel').innerText = 'Version: ' + version;
});

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

ipcRenderer.send('GetVersion');