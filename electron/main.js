const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1380,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'DevPrompt Studio',
    backgroundColor: '#F7F9FC',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL(devServerUrl).catch(() => {
      // If dev server isn't running yet, fallback to built dist if available
      const indexPath = path.join(__dirname, '../dist/index.html');
      if (fs.existsSync(indexPath)) {
        mainWindow.loadFile(indexPath);
      }
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('export:saveFile', async (event, { filename, content }) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: filename,
    filters: [
      { name: 'Markdown Document', extensions: ['md'] },
      { name: 'JSON Document', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (canceled || !filePath) return { success: false };

  fs.writeFileSync(filePath, content, 'utf-8');
  return { success: true, filePath };
});

ipcMain.handle('backup:saveDatabase', async (event, { binaryData, filename }) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: filename || 'devprompt_studio.sqlite',
    filters: [{ name: 'SQLite Database', extensions: ['sqlite', 'db'] }],
  });

  if (canceled || !filePath) return { success: false };

  fs.writeFileSync(filePath, Buffer.from(binaryData));
  return { success: true, filePath };
});

ipcMain.handle('backup:restoreDatabase', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    filters: [{ name: 'SQLite / JSON Backup', extensions: ['sqlite', 'db', 'json'] }],
    properties: ['openFile'],
  });

  if (canceled || filePaths.length === 0) return { success: false };

  const content = fs.readFileSync(filePaths[0]);
  return { success: true, filePath: filePaths[0], data: content };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
