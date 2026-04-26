const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_DIR = process.env.DB_DIR;

if (!DB_DIR) {
  console.error('[ETIQUETAS] DB_DIR não definido.');
  process.exit(1);
}

const dbPath = path.join(DB_DIR, 'mercadao.db');

console.log('[ETIQUETAS] Banco em uso:', dbPath);

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('[ETIQUETAS] Erro ao abrir banco:', err.message);
  } else {
    console.log('[ETIQUETAS] Banco aberto com sucesso.');
  }
});

// 🔍 BUSCA DE PRODUTOS
router.get('/', (req, res) => {
  const busca = req.query.busca || '';

let sql = `
  SELECT id, codigo, nome, preco_venda, codigo_barras, estoque_atual
  FROM produtos
`;

let params = [];

if (busca) {
  sql += ` WHERE nome LIKE ? OR codigo LIKE ? OR codigo_barras LIKE ?`;
  params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
}

sql += ` ORDER BY nome LIMIT 50`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('[ETIQUETAS] Erro na busca:', err);
      return res.status(500).json({ error: 'Erro ao buscar produtos' });
    }

    res.json(rows);
  });
});

module.exports = router;