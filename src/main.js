const { app, BrowserWindow, Menu, protocol, ipcMain,dialog, Tray  } = require('electron');
const log = require('electron-log');
const { autoUpdater } = require("electron-updater");
const path = require('path');
const url = require('url');
const fs = require('fs');

process.env.NODE_ENV = 'develop'
// process.env.NODE_ENV = 'production'


autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let windows = [];
let wallpaperPath = '';
let images = [];
let timer = 0;
let tray = null;
let trayIcon = null;
let mainWindow = null;


//-------------------------------------------------------------------
// Define the menu
//
// THIS SECTION IS NOT REQUIRED
//-------------------------------------------------------------------


//-------------------------------------------------------------------
// Open a window that displays the version
//
// THIS SECTION IS NOT REQUIRED
//
// This isn't required for auto-updates to work, but it's easier
// for the app to show a window than to have to click "About" to see
// that updates are working.
//-------------------------------------------------------------------
let win;

function sendStatusToWindow(text) {
    log.info(text);
    win.webContents.send('message', text);
}

app.on('ready', function () {
    mainWindow = new BrowserWindow({
        height: 400,
        width: 400
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

    if (process.env.NODE_ENV === 'develop') {
        const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
        tray = new Tray('./src/icon.ico');
        Menu.setApplicationMenu(mainMenu);
    } else {
        tray = new Tray(path.join(__dirname,'icon.ico'));
        Menu.setApplicationMenu(null);
    }

    tray.setContextMenu(contextMenu);

    mainWindow.on('minimize', function (event) {
        event.preventDefault();
        mainWindow.hide();
    });
});

ipcMain.on('showWindows', function (e, payload) {
    windows = [];
    timer = payload.time;

    let x;
    for (x = 0; x < payload.count; x++) {
        windows.push(x);
    }

    for (var i in windows) {
        windows[i] = createWindow();
    }

    mainWindow.hide();
});

ipcMain.on('getPath', (e, args) => {
    dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] }, (filePaths) => {
        console.log('Received Request.')
        wallpaperPath = filePaths[0];
        getImages(wallpaperPath)
            .then(function (data) {
                console.log('Images Received')
                data.forEach(fileName => {
                    if (fileName.split('.').pop() === 'jpg') {
                        let image = `${wallpaperPath}\\${fileName}`
                        images.push(image);
                    }
                })
            })
            .then(function () {
                e.sender.send('showPath', wallpaperPath);
            })
            .catch(function (err) {
                console.log(err);
            });
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

autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
})

autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('Update available.');
})

autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('Update not available.');
})

autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater. ' + err);
})

autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message);
})

autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Update downloaded');
});

const getImages = (filePath) => {
    console.log('Getting Images...');
    let promise = new Promise(function (resolve, reject) {
        fs.readdir(filePath, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });

    return promise;
};

const createWindow = () => {
    console.log('Creating New Window...');
    const newWindow = new BrowserWindow(
        {
            width: 800,
            height: 800,
            frame: false
        });
    newWindow.loadURL(url.format({
        pathname: path.join(__dirname, './windows/wallpaper/wallpaperWindow.html'),
        protocol: 'file',
        slashes: true,
    }));

    return newWindow;
};

const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
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
    }
]

const contextMenu = Menu.buildFromTemplate([
    {
        label: 'Show App',
        click() {
            mainWindow.show();
        }
    },
    {
        label: 'Quit',
        click(){
            app.quit();
        }
    }
]);

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

//
// CHOOSE one of the following options for Auto updates
//

//-------------------------------------------------------------------
// Auto updates - Option 1 - Simplest version
//
// This will immediately download an update, then install when the
// app quits.
//-------------------------------------------------------------------
app.on('ready', function () {
    autoUpdater.checkForUpdatesAndNotify();
});

//-------------------------------------------------------------------
// Auto updates - Option 2 - More control
//
// For details about these events, see the Wiki:
// https://github.com/electron-userland/electron-builder/wiki/Auto-Update#events
//
// The app doesn't need to listen to any events except `update-downloaded`
//
// Uncomment any of the below events to listen for them.  Also,
// look in the previous section to see them being used.
//-------------------------------------------------------------------
// app.on('ready', function()  {
//   autoUpdater.checkForUpdates();
// });
// autoUpdater.on('checking-for-update', () => {
// })
// autoUpdater.on('update-available', (info) => {
// })
// autoUpdater.on('update-not-available', (info) => {
// })
// autoUpdater.on('error', (err) => {
// })
// autoUpdater.on('download-progress', (progressObj) => {
// })
// autoUpdater.on('update-downloaded', (info) => {
//   autoUpdater.quitAndInstall();  
// })