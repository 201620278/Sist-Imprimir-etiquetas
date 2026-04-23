const express = require('express');
const path = require('path');
const app = express();

const produtosRouter = require('./rotas/produtos');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/produtos', produtosRouter);

app.listen(3000, () => {
  console.log('SERVIDOR RODANDO EM http://127.0.0.1:3000');
});
