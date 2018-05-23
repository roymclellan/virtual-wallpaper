const electron = require('electron');
const Store = require('electron-store');
const { ipcRenderer, app, dialog, remote } = electron;

let store = new Store();

loadUserPreferences();

ipcRenderer.on('showPath', (e, args) => {
    document.getElementById('pathLabel').innerHTML = args;
    canEnableSubmit()
});

ipcRenderer.on('toast', (e, args) => {
    console.log(args);
    M.toast({html: `<span>${args.text}</span>`,displayLength: args.delay || 5000 });
});

document.getElementById('staticWallpaperButton').onclick = () => {
    ipcRenderer.send('LauchStaticWallpaper');
};

document.getElementById('folderPickerButton').onclick = () => {
    ipcRenderer.send('SetWallpaperPath');
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

document.getElementById('windowsSelect').onchange = (e) => {
    canEnableSubmit();
}

document.getElementById('timeSelect').onchange = (e) => {
    canEnableSubmit();
}

if (document.getElementById('pathLabel').innerHTML == '') {
    document.getElementById('submitButton').disabled = true;
}

function loadUserPreferences() {
    let savedCheckbox = document.getElementById('savePreferences')
    if (Object.keys(store.store).length > 0) {
        savedCheckbox.checked = true;
    } else {
        savedCheckbox.checked = false;
    }

    if (store.has('imageFolderUrl')) {
        document.getElementById('pathLabel').innerText = store.get('imageFolderUrl');
    }
    if (store.has('time')) {
        document.getElementById('timeSelect').value = store.get('time');
    }
    if (store.has('count')) {
        document.getElementById('windowsSelect').value = store.get('count');
    }
};

const canEnableSubmit = () => {
    let windowsSelect = document.getElementById('windowsSelect');
    let timeSelect = document.getElementById('timeSelect');
    let pathLabel = document.getElementById('pathLabel');
    debugger;
    if (windowsSelect.value > 0 &&
        timeSelect.value > 0 &&
        pathLabel.innerHTML.length > 0) {
        debugger;
        document.getElementById('submitButton').disabled = false;
    } else {
        debugger;
        document.getElementById('submitButton').disabled = true;
    }
}

function triggerUpdate() {
    M.Toast.dismissAll();
    ipcRenderer.send('doUpdate');
}

function forceRestart() {
    ipcRenderer.send('quitAndRestart');
}