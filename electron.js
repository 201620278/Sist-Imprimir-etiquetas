const path = require('path');
const fs = require('fs');
const http = require('http');
const { app, BrowserWindow, ipcMain, dialog } = require('electron');

if (!app) {
  console.error('ERRO: este arquivo deve ser iniciado pelo Electron. Use: npm start');
  process.exit(1);
}

let mainWindow;
const PORT = Number(process.env.PORT || 3002);

process.env.PORT = String(PORT);
delete process.env.DB_DIR;

function waitForServer(url, timeoutMs = 15000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    function tryRequest() {
      const req = http.get(url, (res) => {
        res.resume();
        resolve(true);
      });

      req.on('error', () => {
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error('Servidor não respondeu em ' + url));
        } else {
          setTimeout(tryRequest, 500);
        }
      });

      req.setTimeout(2000, () => {
        req.destroy();
      });
    }

    tryRequest();
  });
}

function iniciarServidor() {
  try {
    require('./server.js');
    console.log('Servidor iniciado pelo Electron na porta', PORT);
    return true;
  } catch (err) {
    console.error('Erro ao iniciar servidor:', err);
    dialog.showErrorBox('Erro ao iniciar servidor', err.stack || err.message || String(err));
    return false;
  }
}

async function criarJanela() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.webContents.on('did-fail-load', (_event, code, desc, url) => {
    console.error('Falha ao carregar:', code, desc, url);
  });

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    console.error('Renderer fechou:', details);
  });

  await waitForServer(`http://127.0.0.1:${PORT}/health`);
  await mainWindow.loadURL(`http://127.0.0.1:${PORT}/`);
}

app.whenReady().then(async () => {
  const servidorOk = iniciarServidor();
  if (!servidorOk) return;

  try {
    await criarJanela();
  } catch (err) {
    console.error('Erro ao abrir janela:', err);
    dialog.showErrorBox('Erro ao abrir sistema', err.stack || err.message || String(err));
  }
});

ipcMain.handle('listar-impressoras', async () => {
  const impressoras = await mainWindow.webContents.getPrintersAsync();

  return impressoras.map(p => ({
    name: p.name,
    displayName: p.displayName || p.name,
    isDefault: p.isDefault || false
  }));
});

function obterNomeImpressora() {
  const fs = require('fs');
  const path = require('path');
  const configPath = path.join(__dirname, 'backend', 'config.json');

  try {
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return configData.printerName || 'Impressora Etiquetas';
  } catch (e) {
    console.warn('Erro ao ler configuração da impressora:', e.message);
    return 'Impressora Etiquetas';
  }
}

ipcMain.on('imprimir-etiqueta', async (_event, config = {}) => {
  const largura = Number(config.largura || 100);
  const altura = Number(config.altura || 25);

  mainWindow.webContents.print({
    silent: true,
    printBackground: true,
    deviceName: obterNomeImpressora(),
    margins: {
      marginType: 'none'
    },
    pageSize: {
      width: largura * 1000,
      height: altura * 1000
    }
  }, (success, errorType) => {
    if (!success) {
      console.log('Erro ao imprimir etiqueta:', errorType);
    } else {
      console.log(`Etiqueta enviada: ${largura}x${altura}mm`);
    }
  });
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
