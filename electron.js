const { app, BrowserWindow, dialog } = require('electron');
const { fork } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow;
let serverProcess;

const PORT = 3002;
const DB_DIR = 'C:\\projetos\\MercantilFiscal\\dados';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    autoHideMenuBar: true,
    title: 'Sist. Etiquetas',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    }
  });

  mainWindow.webContents.session.clearCache();
  mainWindow.loadURL(`http://127.0.0.1:${PORT}/`);
}

app.whenReady().then(async () => {
  if (!fs.existsSync(path.join(DB_DIR, 'mercadao.db'))) {
    dialog.showErrorBox(
      'Banco não encontrado',
      `Não encontrei o banco mercadao.db em:\n\n${DB_DIR}`
    );
    app.quit();
    return;
  }

  serverProcess = fork(path.join(__dirname, 'server.js'), [], {
    cwd: __dirname,
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: String(PORT),
      DB_DIR
    }
  });

  await new Promise((resolve) => {
    serverProcess.on('message', (msg) => {
      if (msg === 'ready') resolve();
    });

    setTimeout(resolve, 4000);
  });

  createWindow();
});

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill();
  app.quit();
});