const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');


// Usa o database.js que já lida com ausência do banco
const { getDb } = require('../database');

// 🔍 BUSCA DE PRODUTO
// Importante: esta rota NÃO lista todos os produtos.
// Ela só retorna 1 item quando o usuário informa uma busca.
router.get('/', (req, res) => {
  const db = getDb();

  if (!db) {
    return res.status(503).json({
      error: 'Banco de dados não configurado. Informe o caminho do banco nas configurações.'
    });
  }

  const busca = String(req.query.busca || '').trim();
  if (!busca) {
    return res.json([]);
  }

  const sql = `
    SELECT id, codigo, nome, preco_venda, codigo_barras, estoque_atual
    FROM produtos
    WHERE
      codigo_barras = ?
      OR codigo = ?
      OR nome LIKE ?
      OR codigo_barras LIKE ?
      OR codigo LIKE ?
    ORDER BY
      CASE
        WHEN codigo_barras = ? THEN 1
        WHEN codigo = ? THEN 2
        WHEN nome = ? THEN 3
        WHEN nome LIKE ? THEN 4
        ELSE 5
      END,
      nome ASC
    LIMIT 1
  `;

  const params = [
    busca,
    busca,
    `%${busca}%`,
    `%${busca}%`,
    `%${busca}%`,
    busca,
    busca,
    busca,
    `${busca}%`
  ];

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('[ETIQUETAS] Erro na busca:', err);
      return res.status(500).json({ error: 'Erro ao buscar produto' });
    }

    res.json(rows);
  });
});

module.exports = router;