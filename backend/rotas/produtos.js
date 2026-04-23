const express = require('express');
const router = express.Router();
const db = require('../database-readonly');

router.get('/', (req, res) => {
  const buscaOriginal = String(req.query.busca || '').trim();

  if (!buscaOriginal) {
    return res.json([]);
  }

  const buscaNumerica = buscaOriginal.replace(/\D/g, '');
  const termoLike = `%${buscaOriginal}%`;

  const sql = `
    SELECT
      id,
      codigo,
      nome,
      codigo_barras,
      preco_venda,
      estoque_atual
    FROM produtos
    WHERE
      codigo_barras = ?
      OR codigo = ?
      OR nome LIKE ?
      OR codigo_barras LIKE ?
      OR codigo LIKE ?
    ORDER BY
      CASE
        WHEN codigo_barras = ? THEN 0
        WHEN codigo = ? THEN 1
        WHEN nome LIKE ? THEN 2
        ELSE 3
      END,
      nome ASC
    LIMIT 50
  `;

  const params = [
    buscaNumerica,
    buscaOriginal,
    termoLike,
    `%${buscaNumerica}%`,
    termoLike,
    buscaNumerica,
    buscaOriginal,
    termoLike
  ];

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('[ETIQUETAS] Erro ao buscar produtos:', err.message);
      return res.status(500).json({
        error: 'Erro ao buscar produtos',
        details: err.message
      });
    }

    return res.json(rows || []);
  });
});

module.exports = router;
