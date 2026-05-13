const path = require('path');
const express = require('express');

const app = express();

process.on('uncaughtException', (err) => {
  console.error('[ERRO FATAL]', err.stack || err.message || err);
});

process.on('unhandledRejection', (err) => {
  console.error('[PROMISE REJEITADA]', err && err.stack ? err.stack : err);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const backendBasePath = path.join(__dirname, 'backend');
const frontendBasePath = path.join(__dirname, 'frontend');

console.log('backendBasePath:', backendBasePath);
console.log('frontendBasePath:', frontendBasePath);
console.log('PORT:', process.env.PORT || 3002);
console.log('DB_DIR:', process.env.DB_DIR || '(não definido)');

function carregarRota(url, arquivo) {
  try {
    const rota = require(path.join(backendBasePath, 'rotas', arquivo));
    app.use(url, rota);
    console.log('Rota carregada:', url, arquivo);
  } catch (error) {
    console.error('Erro ao carregar rota:', url, arquivo);
    console.error(error.stack || error.message || error);

    app.use(url, (_req, res) => {
      res.status(500).json({
        error: 'Erro ao carregar rota ' + url,
        detail: error.message || String(error)
      });
    });
  }
}

carregarRota('/api/produtos', 'produtos');
carregarRota('/api/tamanhos-etiqueta', 'tamanhos-etiqueta');
carregarRota('/api/config', 'config');

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    port: process.env.PORT || 3002,
    backendBasePath,
    frontendBasePath
  });
});

app.use(express.static(frontendBasePath));

app.get('/', (_req, res) => {
  res.sendFile(path.join(frontendBasePath, 'index.html'));
});

const PORT = Number(process.env.PORT || 3002);

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Servidor rodando em http://127.0.0.1:${PORT}`);
});
