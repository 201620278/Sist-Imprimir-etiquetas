const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// CAMINHO REAL DO SEU BANCO
const dbPath = 'C:\\projetos\\MercantilFiscal\\dados\\mercadao.db';

console.log('BANCO EM USO:', dbPath);

// valida se o banco existe
if (!fs.existsSync(dbPath)) {
  console.error('ERRO: Banco não encontrado nesse caminho:', dbPath);
  process.exit(1);
}

// conecta
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('ERRO AO ABRIR BANCO:', err.message);
    process.exit(1);
  } else {
    console.log('BANCO SQLITE CONECTADO COM SUCESSO.');
  }
});

module.exports = db;
