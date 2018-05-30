const electron = require('electron');
const { ipcRenderer } = electron;
const log = require('electron-log');
const fs = require('fs');
const $ = require('jquery');
let imagePath = '';
let images = [];

ipcRenderer.on('Launch', (e, args) => {
    console.log(args);
    debugger;
    if (args) {
        let backgroundDiv = document.getElementById('background');

        $('#background').fadeOut(500, function () {
            $(this).attr('src', args).fadeIn(500);
        });
    } else {
        getImage();
    }
});

ipcRenderer.on('close', (e, args) => {
    window.close();
});

ipcRenderer.on('setWallpaperImage', (e, payload) => {
    loadImage(payload);
    setInterval(getImage, payload.timer);
});

const loadImage = (payload) => {
    debugger;
    let filePath = formatURL(payload.path);
    let backgroundDiv = document.getElementById('background');

    $('#background').fadeOut(500, function () {
        $(this).attr('src', filePath).fadeIn(500);
    });
};

const getImage = () => {
    ipcRenderer.send('getWallpaperWindowimage');
};

const formatURL = (path) => {
    debugger;
    let escapedPath = path.split("\\").join("\\\\");
    let fileURL = 'file:///' + escapedPath;

    return fileURL;
}

// getImage();