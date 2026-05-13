// --- Configuração do caminho do banco ---
const API_CONFIG = `${window.location.origin}/api/config`;

async function carregarDbDir() {
  try {
    const res = await fetch(API_CONFIG);
    const data = await res.json();
    document.getElementById('dbDir').value = data.dbDir || '';
  } catch {
    document.getElementById('dbDir').value = '';
  }
}

async function salvarDbDir() {
  const dbDir = document.getElementById('dbDir').value.trim();
  const status = document.getElementById('dbDirStatus');
  status.textContent = '';
  if (!dbDir) {
    status.textContent = 'Informe o caminho.';
    status.style.color = '#bb0000';
    return;
  }
  try {
    const res = await fetch(API_CONFIG, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dbDir })
    });
    if (res.ok) {
      status.textContent = 'Salvo! Reinicie o backend para aplicar.';
      status.style.color = '#007700';
    } else {
      const data = await res.json();
      status.textContent = data.error || 'Erro ao salvar.';
      status.style.color = '#bb0000';
    }
  } catch {
    status.textContent = 'Erro ao salvar.';
    status.style.color = '#bb0000';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  carregarDbDir();
  const btn = document.getElementById('btnSalvarDbDir');
  if (btn) btn.onclick = salvarDbDir;
});
const API_PRODUTOS = `${window.location.origin}/api/produtos`;

function renderizarProdutos(produtos) {
  const lista = document.getElementById('lista');
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
      <div style="font-size:16px;font-weight:bold;text-align:center;margin-bottom:4px;letter-spacing:1px;">ESQUINÃO DA ECONOMIA</div>
      <div style="font-size:18px;font-weight:bold;">${produto.nome || ''}</div>
      <div><strong>ID:</strong> ${produto.id}</div>
      <div><strong>Código de barras:</strong> ${produto.codigo_barras || '-'}</div>
      <div><strong>Preço:</strong> R$ ${Number(produto.preco_venda ?? 0).toFixed(2)}</div>
    </div>
  `
  ).join('');
}

async function carregarProdutos() {
  const lista = document.getElementById('lista');
  const contador = document.getElementById('contador-itens');

  if (!lista) return;

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
  const lista = document.getElementById('lista');

  if (!lista) return;

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

  if (document.getElementById('lista')) {
    carregarProdutos();
  }

  if (btnBuscar) btnBuscar.addEventListener('click', buscarProduto);
  if (btnRecarregar) btnRecarregar.addEventListener('click', carregarProdutos);

  if (inputBusca) {
    inputBusca.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') buscarProduto();
    });
  }
});
