'use strict'

const fs = require('fs');

class FileManager {
    GetImagesFromPath(wallpaperPath) {
        let images = [];

        if (wallpaperPath) {
            let fileNameArray = fs.readdirSync(wallpaperPath);
            fileNameArray.forEach(fileName => {
                if (fileName.split('.').pop() === 'jpg') {
                    let image = `${wallpaperPath}\\${fileName}`
                    images.push(image);
                }
            });
        }

        return images;
    }
};

module.exports = FileManager;