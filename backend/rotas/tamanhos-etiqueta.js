const express = require('express');
const router = express.Router();
const db = require('../database-local');

router.get('/', (req, res) => {
  db.all(`
    SELECT *
    FROM tamanhos_etiqueta
    WHERE ativo = 1
    ORDER BY padrao DESC, nome ASC
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao listar tamanhos' });
    }
    res.json(rows || []);
  });
});

router.post('/', (req, res) => {
  const {
    nome,
    largura_mm,
    altura_mm,
    margem_superior_mm = 2,
    margem_inferior_mm = 2,
    margem_esquerda_mm = 2,
    margem_direita_mm = 2,
    fonte_nome_px = 14,
    fonte_preco_px = 22,
    exibir_codigo_barras = 1,
    padrao = 0
  } = req.body;

  db.run(`
    INSERT INTO tamanhos_etiqueta (
      nome, largura_mm, altura_mm,
      margem_superior_mm, margem_inferior_mm,
      margem_esquerda_mm, margem_direita_mm,
      fonte_nome_px, fonte_preco_px,
      exibir_codigo_barras, padrao
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    nome,
    largura_mm,
    altura_mm,
    margem_superior_mm,
    margem_inferior_mm,
    margem_esquerda_mm,
    margem_direita_mm,
    fonte_nome_px,
    fonte_preco_px,
    exibir_codigo_barras ? 1 : 0,
    padrao ? 1 : 0
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao salvar tamanho' });
    }

    res.json({ ok: true, id: this.lastID });
  });
});

module.exports = router;