const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  executePython: (command) => ipcRenderer.invoke('execute-python', command)
});

window.addEventListener('DOMContentLoaded', () => {
    // You can expose specific APIs to the renderer here if needed
});