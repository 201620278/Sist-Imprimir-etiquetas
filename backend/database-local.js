const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const os = require('os');

const pastaDados = path.join(os.homedir(), 'AppData', 'Roaming', 'SistEtiquetas');
if (!fs.existsSync(pastaDados)) {
  fs.mkdirSync(pastaDados, { recursive: true });
}

const dbPath = path.join(pastaDados, 'dados.db');

console.log('Banco em:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao abrir banco local do Etiquetas:', err.message);
  } else {
    console.log('Banco local do Etiquetas conectado.');

    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS tamanhos_etiqueta (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          largura_mm INTEGER NOT NULL,
          altura_mm INTEGER NOT NULL,
          margem_superior_mm INTEGER DEFAULT 2,
          margem_inferior_mm INTEGER DEFAULT 2,
          margem_esquerda_mm INTEGER DEFAULT 2,
          margem_direita_mm INTEGER DEFAULT 2,
          fonte_nome_px INTEGER DEFAULT 14,
          fonte_preco_px INTEGER DEFAULT 22,
          exibir_codigo_barras INTEGER DEFAULT 1,
          ativo INTEGER DEFAULT 1,
          padrao INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.get(`SELECT COUNT(*) AS total FROM tamanhos_etiqueta`, [], (err, row) => {
        if (!err && row && row.total === 0) {
          db.run(`
            INSERT INTO tamanhos_etiqueta
            (nome, largura_mm, altura_mm, margem_superior_mm, margem_inferior_mm, margem_esquerda_mm, margem_direita_mm, fonte_nome_px, fonte_preco_px, exibir_codigo_barras, padrao)
            VALUES
            ('50x30 mm', 50, 30, 2, 2, 2, 2, 14, 22, 1, 1),
            ('60x40 mm', 60, 40, 2, 2, 2, 2, 16, 24, 1, 0),
            ('40x20 mm', 40, 20, 1, 1, 1, 1, 12, 18, 0, 0)
          `);
        }
      });
    });
  }
});

module.exports = db;