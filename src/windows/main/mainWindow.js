const electron = require('electron');
const Store = require('electron-store');
const { ipcRenderer, app, dialog, remote } = electron;

let store = new Store();

loadUserPreferences();

ipcRenderer.on('showPath', (e, args) => {
    document.getElementById('pathLabel').value = args;
    canEnableSubmit()
});

ipcRenderer.on('toast', (e, args) => {
    console.log(args);
    M.toast({ html: `<span>${args.text}</span>`, displayLength: args.delay || 5000 });
});

document.getElementById('savePreferencesButton').onclick = (e) => {
    let dropdown = document.querySelector('#windowsSelect')
    let count = dropdown.options[dropdown.selectedIndex].value;

    if(count > 0){
        store.set('count', count);
    }else{
        M.toast({html: "Select a window count."});
    }
    
    let timeSelect = document.getElementById('timeSelect');
    let time = timeSelect.options[timeSelect.selectedIndex].value;

    if(time > 0){
        store.set('count', time);
    }else{
        M.toast({html: "Select a time."});
    }

    let pathLabel = document.getElementById('pathLabel');
    let wallpaperPath = pathLabel.value;

    if (wallpaperPath) {
        store.set('imageFolderUrl', wallpaperPath);
    } else {
        M.toast({html: "Select an images folder."});
    }
};

document.getElementById('staticWallpaperButton').onclick = () => {
    ipcRenderer.send('LauchStaticWallpaper');
};

document.getElementById('folderPickerButton').onclick = (e) => {
    e.preventDefault();
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

if (document.getElementById('pathLabel').value == '') {
    document.getElementById('submitButton').disabled = true;
}

function loadUserPreferences() {
    if (store.has('imageFolderUrl')) {
        document.getElementById('pathLabel').value = store.get('imageFolderUrl');
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
    if (windowsSelect.value > 0 &&
        timeSelect.value > 0 &&
        pathLabel.value.length > 0) {
        document.getElementById('submitButton').disabled = false;
    } else {
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