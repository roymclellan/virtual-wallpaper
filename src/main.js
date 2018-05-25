const { app, BrowserWindow, Menu, protocol, ipcMain, dialog, Tray, shell, Notification } = require('electron');
const log = require('electron-log');
const { autoUpdater } = require("electron-updater");
const path = require('path');
const url = require('url');
const Store = require('electron-store');
const FileManager = require('./services/fileManager');

process.env.NODE_ENV = 'develop'
// process.env.NODE_ENV = 'production'

let store = new Store();
let fileManager = new FileManager();

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let wallpaperPath = store.get('imageFolderUrl') || '';
let images = fileManager.GetImagesFromPath(wallpaperPath);
let timer = store.get('time') || 0;
let tray = null;
let trayIcon = null;
let mainWindow;
let updateWindow;

const sendToast = (text, delay) => {
    let args = { text, delay };
    mainWindow.webContents.send('toast', args);

    let notification = new Notification({
        title: "Virtual Wallpaper",
        body: text,
    });

    notification.show();
};

const createWindow = (staticImagePath) => {
    log.info('Creating New Window...');
    const newWindow = new BrowserWindow(
        {
            width: 800,
            height: 800,
            frame: false,
            show: false
        });

    newWindow.loadURL(url.format({
        pathname: path.join(__dirname, './windows/wallpaper/wallpaperWindow.html'),
        protocol: 'file',
        slashes: true,
    }));

    newWindow.once('ready-to-show', () => {
        newWindow.show();
        newWindow.webContents.send('Launch', staticImagePath);
    });

    return newWindow;
};

const openUpdateWindow = () => {
    updateWindow = new BrowserWindow({
        height: 200,
        width: 400,
        autoHideMenuBar: true,
        show: false
    });

    updateWindow.loadURL(url.format({
        pathname: path.join(__dirname, './windows/update/updateWindow.html'),
        protocol: 'file',
        slashes: true
    }));

    updateWindow.once('ready-to-show',
        () => {
            updateWindow.show();
            autoUpdater.downloadUpdate();
        });
};

app.on('ready', function () {
    mainWindow = new BrowserWindow({
        height: 500,
        width: 500,
        show: false
    })

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, './windows/main/mainWindow.html'),
        protocol: 'file',
        slashes: true
    }));

    mainWindow.on('closed', function () {
        mainWindow = null;
        app.quit();
    });

    mainWindow.on('minimize', function (event) {
        event.preventDefault();
        mainWindow.hide();
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    if (process.env.NODE_ENV === 'develop') {
        tray = new Tray('./build/icon.ico');
    } else {
        tray = new Tray(path.join(__dirname, 'icon.ico'));
    }

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    const contextMenu = Menu.buildFromTemplate(contextMenuTemplate);

    Menu.setApplicationMenu(mainMenu);
    tray.setContextMenu(contextMenu);

    if (process.env.NODE_ENV === 'production') {
        autoUpdater.autoDownload = false;
        autoUpdater.checkForUpdates().then(function (data) { });
    };
});

ipcMain.on('SavePreferencs', (e, args) => {
    store.set('imageFolderUrl', wallpaperPath);
    store.set('time', args.time);
    store.set('count', args.count);
});

ipcMain.on('LauchStaticWallpaper', (e, args) => {
    dialog.showOpenDialog(mainWindow, {}, (filePath) => {
        if (filePath) {
            createWindow(filePath[0]);
        } else {
            log.error('No image selected when trying to launch a static wallpaper');
        }
    })
});

ipcMain.on('showWindows', function (e, payload) {
    timer = payload.time;

    // if (payload.savePreferences) {
    //     store.set('imageFolderUrl', wallpaperPath);
    //     store.set('time', payload.time);
    //     store.set('count', payload.count);
    // }

    images = fileManager.GetImagesFromPath(wallpaperPath)

    for (x = 0; x < payload.count; x++) {
        createWindow();
    }

    mainWindow.hide();
});

ipcMain.on('SetWallpaperPath', (e, args) => {
    dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] }, (filePaths) => {
        if (filePaths) {
            wallpaperPath = filePaths[0];
        } else {
            wallpaperPath = null;
        }

        e.sender.send('showPath', wallpaperPath);
    });

});

ipcMain.on('getWallpaperWindowimage', (e, args) => {
    let imageIndex = Math.floor(Math.random() * images.length) + 1;

    let payload = {
        path: images[imageIndex],
        timer: timer
    }
    e.sender.send('setWallpaperImage', payload);
})

ipcMain.on('doUpdate', (e, args) => {
    openUpdateWindow();
});

ipcMain.on('quitAndRestart', (e, args) => {
    autoUpdater.quitAndInstall();
});

autoUpdater.on('checking-for-update', () => {
    log.info('Checking for update...');
})

autoUpdater.on('update-available', (info) => {
    sendToast('<span>A new update is available!</span><button onclick=triggerUpdate() class="btn-flat toast-action">Download</button>', 30000);
})

autoUpdater.on('update-not-available', (info) => {
    sendToast('No Update Available', 5000);
})

autoUpdater.on('error', (err) => {
    log.error(err);
    sendToast('Error occurred during update.');
})

autoUpdater.on('download-progress', (progressObj) => {
    updateWindow.webContents.send('updateProgress', progressObj.percent);
})

autoUpdater.on('update-downloaded', (info) => {
    updateWindow.close();
    sendToast('<span>Update downloaded. Restart the Program to apply updates.</span><button onclick=forceRestart() class="btn-flat toast-action">Restart</button>');
});

const mainMenuTemplate = [
    {
        label: 'App',
        submenu: [
            {
                label: 'Quick Wallpaper',
                click() {
                    createWindow();
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin'
                    ? 'Command+Q'
                    : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    },
    {
        label: 'About',
        submenu: [
            {
                label: `Version ${app.getVersion()}`
            },
            {
                label: 'Check for update',
                click() {
                    autoUpdater.checkForUpdates();
                }
            },
            {
                label: 'Product Documentation',
                click() {
                    shell.openExternal('https://github.com/roymclellan/virtual-wallpaper/blob/master/README.md')
                }
            }
        ]
    }
]

const contextMenuTemplate = [
    {
        label: 'Show App',
        click() {
            mainWindow.show();
        }
    },
    {
        label: 'Quick Wallpaper',
        click() {
            createWindow();
        }
    },
    {
        label: 'Quit',
        click() {
            app.quit();
        }
    }
];

//if on a mac, add empty object to menu.
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
};

//Add devtools item if not in production
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin'
                    ? 'Command+I'
                    : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
};
