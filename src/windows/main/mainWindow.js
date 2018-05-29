const electron = require('electron');
const Store = require('electron-store');
const { ipcRenderer, app, dialog, remote } = electron;

let store = new Store();

ipcRenderer.on('showPath', (e, args) => {
    document.getElementById('pathLabel').value = args;
    canEnableSubmit();
    canClearPreferences();
});

ipcRenderer.on('toast', (e, args) => {
    console.log(args);
    M.toast({ html: `<span>${args.text}</span>`, displayLength: args.delay || 5000 });
});

document.getElementById('clearPreferencesButton').onclick = () => {
    store.clear();

    document.getElementById('pathLabel').value = "";
    document.getElementById('windowsSelect').selectedIndex = 0;
    document.getElementById('timeSelect').selectedIndex = 0;
    document.getElementById('clearPreferencesButton').disabled = true;
    document.getElementById('submitButton').disabled = true;
    document.getElementById('submitPrefsSwitch').disabled = true;
};

document.getElementById('savePreferencesButton').onclick = (e) => {
    e.preventDefault();
    let dropdown = document.querySelector('#windowsSelect')
    let count = dropdown.options[dropdown.selectedIndex].value;

    if (count > 0) {
        store.set('count', count);
    } else {
        M.toast({ html: "Select a window count." });
    }

    let timeSelect = document.getElementById('timeSelect');
    let time = timeSelect.options[timeSelect.selectedIndex].value;

    if (time > 0) {
        store.set('time', time);
    } else {
        M.toast({ html: "Select a time." });
    }

    let pathLabel = document.getElementById('pathLabel');
    let wallpaperPath = pathLabel.value;

    if (wallpaperPath) {
        store.set('imageFolderUrl', wallpaperPath);
    } else {
        M.toast({ html: "Select an images folder." });
    }

    canClearPreferences();
};

document.getElementById('staticWallpaperButton').onclick = () => {
    ipcRenderer.send('LauchStaticWallpaper');
};

document.getElementById('folderPickerButton').onclick = (e) => {
    e.preventDefault();
    ipcRenderer.send('SetWallpaperPath');
}

document.getElementById('submitButton').onclick = () => {
    debugger;
    let submitPrefsSwitch = document.getElementById('submitPrefsSwitch').checked;

    let count;
    let time;

    if (submitPrefsSwitch) {
        count = store.get('count');
        time = store.get('time');
    } else {
        let dropdown = document.querySelector('#windowsSelect')
        count = dropdown.options[dropdown.selectedIndex].value;

        let timeSelect = document.getElementById('timeSelect');
        time = timeSelect.options[timeSelect.selectedIndex].value;
    }

    let payload = {
        count,
        time,
    }

    ipcRenderer.send('showWindows', payload);
};

document.getElementById('windowsSelect').onchange = (e) => {
    canEnableSubmit();
    canClearPreferences();
}

document.getElementById('timeSelect').onchange = (e) => {
    canEnableSubmit();
    canClearPreferences();
}

if (document.getElementById('pathLabel').value == '') {
    document.getElementById('submitButton').disabled = true;
}

const canEnableSubmit = () => {
    debugger;
    let windowsSelect = document.getElementById('windowsSelect');
    let timeSelect = document.getElementById('timeSelect');
    let pathLabel = document.getElementById('pathLabel');
    if (windowsSelect.value > 0 &&
        timeSelect.value > 0 &&
        pathLabel.value.length > 0) {
        document.getElementById('submitButton').disabled = false;
        document.getElementById('savePreferencesButton').disabled = false;
    } else {
        document.getElementById('submitButton').disabled = true;
        document.getElementById('savePreferencesButton').disabled = true;
    }
}

const canClearPreferences = () => {
    debugger;
    if (Object.keys(store.store).length == 3) {
        document.getElementById('clearPreferencesButton').disabled = false;
        document.getElementById('submitPrefsSwitch').disabled = false;
    } else {
        document.getElementById('clearPreferencesButton').disabled = true;
        document.getElementById('submitPrefsSwitch').disabled = true;
    }
}

function triggerUpdate() {
    M.Toast.dismissAll();
    ipcRenderer.send('doUpdate');
}

function forceRestart() {
    ipcRenderer.send('quitAndRestart');
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

    canClearPreferences();
    canEnableSubmit();
};

loadUserPreferences();
