const electron = require('electron');
const { ipcRenderer } = electron;
const fs = require('fs');
const $ = require('jquery');
let imagePath = '';
let images = [];

ipcRenderer.on('close', (e, args) => {
    window.close();
});

ipcRenderer.on('setWallpaperImage', (e, payload) => {
    loadImage(payload);
    setInterval(getImage, payload.timer);
});

const loadImage = (payload) => {
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
    let escapedPath = path.split("\\").join("\\\\");
    let fileURL = 'file:///' + escapedPath;

    return fileURL;
}

getImage();