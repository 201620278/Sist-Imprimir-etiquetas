const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const configPath = path.join(__dirname, 'config.json');

let db = null;
let dbPathAtual = null;

function lerConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch {
    return { dbDir: '' };
  }
}

function getDb() {
  const config = lerConfig();
  const dbDir = String(config.dbDir || '').trim();

  if (!dbDir) {
    return null;
  }

  const dbPath = path.join(dbDir, 'mercadao.db');

  if (!fs.existsSync(dbPath)) {
    console.warn('[ETIQUETAS] Banco não encontrado:', dbPath);
    return null;
  }

  if (db && dbPathAtual === dbPath) {
    return db;
  }

  if (db) {
    db.close();
    db = null;
  }

  dbPathAtual = dbPath;

  db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('[ETIQUETAS] Erro ao abrir banco:', err.message);
      db = null;
    } else {
      console.log('[ETIQUETAS] Banco conectado:', dbPath);
    }
  });

  return db;
}

module.exports = {
  getDb
};
