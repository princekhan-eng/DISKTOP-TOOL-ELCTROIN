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
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });

  // Relay renderer console messages to terminal for transparent debugging
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer] ${message}`);
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.warn(`[Electron] Failed to load URL (${errorCode}: ${errorDescription}), falling back to dist/index.html`);
    const indexPath = path.join(__dirname, '../dist/index.html');
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    }
  });

  const indexPath = path.join(__dirname, '../dist/index.html');

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (fs.existsSync(indexPath)) {
    mainWindow.loadFile(indexPath);
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('sqlite:getWasmBinary', async () => {
  try {
    const candidates = [
      path.join(__dirname, '../dist/sql-wasm.wasm'),
      path.join(__dirname, '../public/sql-wasm.wasm'),
    ];
    for (const target of candidates) {
      if (fs.existsSync(target)) {
        const buf = fs.readFileSync(target);
        return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      }
    }
  } catch (err) {
    console.error('Failed to read sql-wasm.wasm in main process:', err);
  }
  return null;
});

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
