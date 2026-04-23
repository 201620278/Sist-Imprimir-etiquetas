const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    backgroundColor: '#ffffff',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const arquivoHtml = path.join(__dirname, 'frontend', 'index.html');

  console.log('========================================');
  console.log('Iniciando janela Electron');
  console.log('Diretório atual (__dirname):', __dirname);
  console.log('Arquivo HTML esperado:', arquivoHtml);
  console.log('HTML existe?', fs.existsSync(arquivoHtml));
  console.log('========================================');

  if (!fs.existsSync(arquivoHtml)) {
    mainWindow.loadURL(`
      data:text/html;charset=utf-8,
      <html>
        <body style="font-family:Arial;padding:20px;background:#fff;color:#111;">
          <h2>Erro: index.html não encontrado</h2>
          <p><b>Caminho esperado:</b> ${arquivoHtml.replace(/\\/g, '/')}</p>
        </body>
      </html>
    `);
    //mainWindow.webContents.openDevTools();
    return;
  }

  mainWindow.loadFile(arquivoHtml);

  //mainWindow.webContents.openDevTools();

  mainWindow.webContents.on('did-start-loading', () => {
    console.log('Renderer: começou a carregar');
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Renderer: terminou de carregar');
    console.log('URL atual:', mainWindow.webContents.getURL());
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Erro ao carregar a janela:', errorCode, errorDescription, validatedURL);

    mainWindow.loadURL(`
      data:text/html;charset=utf-8,
      <html>
        <body style="font-family:Arial;padding:20px;background:#fff;color:#111;">
          <h2>Erro ao carregar a tela</h2>
          <p><b>Código:</b> ${errorCode}</p>
          <p><b>Descrição:</b> ${String(errorDescription).replace(/</g, '&lt;')}</p>
          <p><b>URL:</b> ${String(validatedURL || '').replace(/</g, '&lt;')}</p>
        </body>
      </html>
    `);
  });

  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('Renderer caiu:', details);
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`Console renderer [${level}] ${sourceId}:${line} -> ${message}`);
  });

  mainWindow.on('unresponsive', () => {
    console.error('Janela ficou sem responder');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  try {
    console.log('Tentando iniciar server.js...');
    require('./server');
    console.log('server.js iniciado com sucesso');
  } catch (error) {
    console.error('Erro ao iniciar server.js:', error);

    dialog.showErrorBox(
      'Erro ao iniciar servidor interno',
      String(error && error.stack ? error.stack : error)
    );
  }

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});