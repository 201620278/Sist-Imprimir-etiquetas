process.env.DB_DIR = 'C:\\projetos\\MercantilFiscal\\dados';

const path = require('path');
const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isPackaged = process.mainModule && process.mainModule.filename.includes('app.asar');

const backendBasePath = isPackaged
  ? path.join(process.resourcesPath, 'backend')
  : path.join(__dirname, 'backend');

console.log('Modo empacotado:', isPackaged);
console.log('process.resourcesPath:', process.resourcesPath);
console.log('backendBasePath:', backendBasePath);

let produtosRouter;

try {
  produtosRouter = require(path.join(backendBasePath, 'rotas', 'produtos'));
  console.log('Rota de produtos carregada com sucesso.');
} catch (error) {
  console.error('Erro ao carregar rota de produtos:', error);
  process.exit(1);
}

app.use('/api/produtos', produtosRouter);

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    backendBasePath
  });
});

const PORT = 3000;

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Servidor rodando em http://127.0.0.1:${PORT}`);
});