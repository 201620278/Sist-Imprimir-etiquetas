const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const configPath = path.join(__dirname, '../config.json');

// GET config atual
router.get('/', (req, res) => {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    res.json(config);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao ler configuração.' });
  }
});

// POST para atualizar dbDir ou printerName
router.post('/', (req, res) => {
  const { dbDir, printerName } = req.body;
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (dbDir !== undefined) {
      config.dbDir = dbDir;
    }
    if (printerName !== undefined) {
      config.printerName = printerName;
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    res.json({ ok: true, dbDir: config.dbDir, printerName: config.printerName });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao salvar configuração.' });
  }
});

module.exports = router;
