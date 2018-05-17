const { ipcRenderer } = require('electron');

ipcRenderer.on('message', (event, text) => {
    console.log('Message Recieved: ' + message);
    var message = document.getElementById('updateMessage');
    message.innerText = text;
});
