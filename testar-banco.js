const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('C:\\projetos\\MercantilFiscal\\dados\\mercadao.db');

db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", [], (e, r) => {
  console.log('TABELAS:', r);

  db.all("PRAGMA table_info(produtos)", [], (e2, c) => {
    console.log('COLUNAS PRODUTOS:', c);

    db.all("SELECT * FROM produtos LIMIT 3", [], (e3, p) => {
      console.log('AMOSTRA:', p);
      db.close();
    });
  });
});