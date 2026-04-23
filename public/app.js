const listaProdutos = document.getElementById('listaProdutos');
const totalResultados = document.getElementById('totalResultados');
const buscaInput = document.getElementById('busca');
const btnBuscar = document.getElementById('btnBuscar');
const btnRecarregar = document.getElementById('btnRecarregar');
const tamanhoEtiqueta = document.getElementById('tamanhoEtiqueta');
const templateProduto = document.getElementById('templateProduto');

function moeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function limparLista() {
  listaProdutos.innerHTML = '';
}

function mostrarVazio(texto) {
  listaProdutos.innerHTML = `<div class="mensagem-vazia">${texto}</div>`;
  totalResultados.textContent = '0 itens';
}

async function carregarProdutos() {
  const termo = buscaInput.value.trim();

  try {
    limparLista();
    listaProdutos.innerHTML = `<div class="mensagem-vazia">Carregando produtos...</div>`;

    const rota = termo
      ? `/api/produtos/buscar?termo=${encodeURIComponent(termo)}`
      : '/api/produtos';

    const resposta = await fetch(rota);
    const data = await resposta.json();

    if (!resposta.ok) {
      throw new Error(data.erro || 'Erro ao carregar produtos.');
    }

    const produtos = Array.isArray(data) ? data : (data.produtos || []);

    limparLista();

    if (!produtos.length) {
      mostrarVazio('Nenhum produto encontrado.');
      return;
    }

    totalResultados.textContent = `${produtos.length} ${produtos.length === 1 ? 'item' : 'itens'}`;

    produtos.forEach((produto) => {
      const clone = templateProduto.content.cloneNode(true);

      clone.querySelector('.produto-nome').textContent = produto.nome || 'Sem nome';
      clone.querySelector('.produto-codigo').textContent = `Codigo: ${produto.codigo_barras || produto.codigo || 'Nao informado'}`;
      clone.querySelector('.produto-estoque').textContent = `Estoque: ${produto.estoque ?? produto.estoque_atual ?? 0}`;
      clone.querySelector('.preco').textContent = moeda(produto.preco ?? produto.preco_venda ?? 0);

      const inputQtd = clone.querySelector('.input-qtd');
      const btnImprimir = clone.querySelector('.btn-imprimir');

      btnImprimir.addEventListener('click', () => {
        const quantidade = Number(inputQtd.value || 1);
        imprimirEtiqueta(produto, quantidade, tamanhoEtiqueta.value);
      });

      listaProdutos.appendChild(clone);
    });
  } catch (error) {
    mostrarVazio(`Erro: ${error.message}`);
  }
}

function obterDimensoesEtiqueta(formato) {
  const mapa = {
    '50x30': { largura: '50mm', altura: '30mm', nome: '50x30 mm' },
    '40x30': { largura: '40mm', altura: '30mm', nome: '40x30 mm' },
    '60x40': { largura: '60mm', altura: '40mm', nome: '60x40 mm' }
  };

  return mapa[formato] || mapa['50x30'];
}

function escapeHtml(texto) {
  return String(texto || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function imprimirEtiqueta(produto, quantidade, formato) {
  if (!quantidade || quantidade < 1) {
    alert('Informe uma quantidade valida.');
    return;
  }

  const dim = obterDimensoesEtiqueta(formato);
  const preco = moeda(produto.preco ?? produto.preco_venda ?? 0);
  const codigo = produto.codigo_barras || produto.codigo || 'SEM CODIGO';
  const nome = produto.nome || 'PRODUTO';
  const tituloJanela = `Imprimindo: ${nome}`;

  const etiquetas = Array.from({ length: quantidade }).map(() => `
    <div class="etiqueta">
      <div class="nome">${escapeHtml(nome)}</div>
      <div class="codigo">Cod: ${escapeHtml(codigo)}</div>
      <div class="preco">${escapeHtml(preco)}</div>
    </div>
  `).join('');

  const janela = window.open('', '_blank', 'width=900,height=700');
  janela.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(tituloJanela)}</title>
      <style>
        @page {
          size: ${dim.largura} ${dim.altura};
          margin: 0;
        }
        * { box-sizing: border-box; }
        html, body {
          margin: 0;
          padding: 0;
          background: white;
          font-family: Arial, Helvetica, sans-serif;
        }
        .etiqueta {
          width: ${dim.largura};
          height: ${dim.altura};
          padding: 2mm;
          page-break-after: always;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
        }

        .nome {
          font-size: 9pt;
          font-weight: bold;
          line-height: 1.1;
          max-height: 11mm;
          overflow: hidden;
        }

        .codigo {
          font-size: 7pt;
        }

        .preco {
          font-size: 15pt;
          font-weight: bold;
          text-align: right;
        }
      </style>
    </head>
    <body>
      ${etiquetas}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      <\/script>
    </body>
    </html>
  `);
  janela.document.close();
}

btnBuscar.addEventListener('click', carregarProdutos);

btnRecarregar.addEventListener('click', () => {
  buscaInput.value = '';
  carregarProdutos();
});

buscaInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') carregarProdutos();
});

carregarProdutos();