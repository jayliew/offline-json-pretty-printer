const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    win.loadFile('index.html');
}

ipcMain.handle('execute-python', async (event, command) => {
  // Execute the Python command and return the result using a Promise.
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      resolve({
        error: error ? error.message : null,
        stdout,
        stderr
      });
    });
  });
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});