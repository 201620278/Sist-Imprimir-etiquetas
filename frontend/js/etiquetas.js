const API_PRODUTOS = `${window.location.origin}/api/produtos`;

function renderizarProdutos(produtos) {
  const lista = document.getElementById('lista-produtos');
  const contador = document.getElementById('contador-itens');

  if (!lista) return;

  if (!Array.isArray(produtos) || produtos.length === 0) {
    lista.innerHTML = '<div>Nenhum produto encontrado.</div>';
    if (contador) contador.textContent = '0 itens';
    return;
  }

  if (contador) contador.textContent = `${produtos.length} itens`;

  lista.innerHTML = produtos.map(
    (produto) => `
    <div style="border:1px solid #ddd;border-radius:8px;padding:12px;margin-bottom:10px;background:#fff;">
      <div style="font-size:18px;font-weight:bold;">${produto.nome || ''}</div>
      <div><strong>ID:</strong> ${produto.id}</div>
      <div><strong>Código de barras:</strong> ${produto.codigo_barras || '-'}</div>
      <div><strong>Preço:</strong> R$ ${Number(produto.preco_venda ?? 0).toFixed(2)}</div>
    </div>
  `
  ).join('');
}

async function carregarProdutos() {
  const lista = document.getElementById('lista-produtos');
  const contador = document.getElementById('contador-itens');

  try {
    lista.innerHTML = '<div>Carregando produtos...</div>';

    const response = await fetch(API_PRODUTOS, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao carregar produtos');
    }

    if (!Array.isArray(data) || data.length === 0) {
      lista.innerHTML = '<div>Nenhum produto encontrado.</div>';
      if (contador) contador.textContent = '0 itens';
      return;
    }

    if (contador) contador.textContent = `${data.length} itens`;

    renderizarProdutos(data);
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    lista.innerHTML = `<div style="padding:10px; color:red;">${error.message}</div>`;
    if (contador) contador.textContent = '0 itens';
  }
}

async function buscarProduto() {
  const input = document.getElementById('buscar-produto');
  const termo = input.value.trim();
  const lista = document.getElementById('lista-produtos');

  try {
    lista.innerHTML = '<div>Buscando produto...</div>';

    const response = await fetch(
      `${API_PRODUTOS}?busca=${encodeURIComponent(termo)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar produto');
    }

    if (!Array.isArray(data) || data.length === 0) {
      lista.innerHTML = '<div>Nenhum produto encontrado.</div>';
      return;
    }

    renderizarProdutos(data);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    lista.innerHTML = `<div style="padding:10px; color:red;">${error.message}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btnBuscar = document.getElementById('btnBuscar');
  const btnRecarregar = document.getElementById('btnRecarregar');
  const inputBusca = document.getElementById('buscar-produto');

  carregarProdutos();

  if (btnBuscar) btnBuscar.addEventListener('click', buscarProduto);
  if (btnRecarregar) btnRecarregar.addEventListener('click', carregarProdutos);

  if (inputBusca) {
    inputBusca.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') buscarProduto();
    });
  }
});
