const electron = require('electron');
const Store = require('electron-store');
const { ipcRenderer, app, dialog, remote } = electron;

let store = new Store();
let imageFolderUrl;
let time;
let count;

loadUserPreferences();

ipcRenderer.on('showPath', (e, args) => {
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
    ipcRenderer.send('getPath');
}

document.getElementById('submitButton').onclick = () => {
    let dropdown = document.querySelector('#windowsSelect')
    let count = dropdown.options[dropdown.selectedIndex].value;

    let timeSelect = document.getElementById('timeSelect');
    let time = timeSelect.options[timeSelect.selectedIndex].value;
    
    let savePreferences = document.getElementById('savePreferences').checked;
    
    let payload = {
        count,
        time,
        savePreferences
    }
    
    ipcRenderer.send('showWindows', payload);
};

if(document.getElementById('pathLabel').innerHTML == ''){
    document.getElementById('submitButton').disabled = true;
}

ipcRenderer.send('GetVersion');

function loadUserPreferences() {
    imageFolderUrl = store.get('imageFolderUrl');
    time = store.get('time');
    count = store.get('count');
    console.log(imageFolderUrl, time, count);

    if(imageFolderUrl){
        document.getElementById('pathLabel').innerText = imageFolderUrl;
        ipcRenderer.send('pushPath');
    }
    if(time){
        document.getElementById('timeSelect').value = time;   
    }
    if(count){
        document.getElementById('windowsSelect').value = count;
    }
};
