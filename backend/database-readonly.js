const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = process.env.DB_DIR || 'C:\\projetos\\MercantilFiscal\\dados';
const dbPath = path.join(dbDir, 'mercadao.db');

console.log('[ETIQUETAS] Banco em uso:', dbPath);
console.log('[ETIQUETAS] Banco existe?', fs.existsSync(dbPath));

const db = new sqlite3.Database(
  dbPath,
  sqlite3.OPEN_READONLY,
  (err) => {
    if (err) {
      console.error('[ETIQUETAS] Erro ao abrir banco em leitura:', err.message);
    } else {
      console.log('[ETIQUETAS] Banco aberto em modo leitura.');
    }
  }
);

module.exports = db;