const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  getWasmBinary: () => ipcRenderer.invoke('sqlite:getWasmBinary'),
  exportFile: (data) => ipcRenderer.invoke('export:saveFile', data),
  backupDatabase: (data) => ipcRenderer.invoke('backup:saveDatabase', data),
  restoreDatabase: () => ipcRenderer.invoke('backup:restoreDatabase'),
});
