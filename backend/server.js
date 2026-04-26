const fs = require('fs');
const path = require('path');
const app = require('express')();

const logPath = path.join(require('os').homedir(), 'Desktop', 'backend-log.txt');

function log(msg) {
  fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
}

log('Servidor iniciando...');
log('__dirname: ' + __dirname);
log('process.cwd(): ' + process.cwd());

process.on('uncaughtException', (err) => {
  log('uncaughtException: ' + (err.stack || err.message));
});

process.on('unhandledRejection', (err) => {
  log('unhandledRejection: ' + (err && err.stack ? err.stack : String(err)));
});

const produtosRouter = require('./rotas/produtos');
const tamanhosEtiquetaRouter = require('./rotas/tamanhos-etiqueta');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/produtos', produtosRouter);
app.use('/api/tamanhos-etiqueta', tamanhosEtiquetaRouter);

app.listen(3000, () => {
  console.log('SERVIDOR RODANDO EM http://127.0.0.1:3000');
});
