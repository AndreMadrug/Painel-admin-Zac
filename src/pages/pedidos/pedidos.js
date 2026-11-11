// Tela — Pedidos: lista com busca e filtros (somente consulta).
import { montarLista } from '../../components/lista.js';
import { selo } from '../../components/selo.js';
import { listarPedidos, STATUS } from '../../modules/pedidos/dados.js';
import { formatarMoeda, formatarDataHora, lerData, normalizar, esc } from '../../lib/format.js';

export function paginaPedidos({ container }) {
  container.innerHTML = `
    <div class="pagina__topo">
      <div>
        <h1>Pedidos</h1>
        <p class="pagina__subtitulo">Todos os pedidos da plataforma, para consulta.</p>
      </div>
    </div>
    <div data-lista></div>`;

  const lista = montarLista(container.querySelector('[data-lista]'), {
    chave: 'pedidos',
    nomeItens: 'pedidos',
    filtros: [
      {
        nome: 'busca',
        tipo: 'texto',
        rotulo: 'Buscar pedido',
        placeholder: 'Buscar por número, comprador ou vendedor…',
      },
      {
        nome: 'status',
        tipo: 'select',
        rotulo: 'Status do pedido',
        todos: 'Todos os status',
        opcoes: Object.entries(STATUS).map(([valor, s]) => ({ valor, rotulo: s.rotulo })),
      },
    ],
    colunas: [
      { chave: 'id', rotulo: 'Pedido', ordenavel: true, render: (p) => `<a href="#/pedidos/${esc(p.id)}">${esc(p.id)}</a>` },
      {
        chave: 'comprador',
        rotulo: 'Partes',
        ordenavel: true,
        render: (p) => `${esc(p.comprador)}<small>vendedor: ${esc(p.vendedor)}</small>`,
      },
      { chave: 'total', rotulo: 'Total', numerica: true, ordenavel: true, render: (p) => formatarMoeda(p.total) },
      {
        chave: 'criadoEm',
        rotulo: 'Data',
        ordenavel: true,
        valorOrdem: (p) => lerData(p.criadoEm).getTime(),
        render: (p) => esc(formatarDataHora(p.criadoEm)),
      },
      {
        chave: 'status',
        rotulo: 'Status',
        ordenavel: true,
        valorOrdem: (p) => STATUS[p.status].rotulo,
        render: (p) => selo(STATUS[p.status].rotulo, STATUS[p.status].variante),
      },
    ],
    ordemPadrao: { chave: 'criadoEm', direcao: 'desc' },
    porPagina: 8,
    carregar: listarPedidos,
    filtrar: (p, filtros) => {
      if (filtros.status && p.status !== filtros.status) return false;
      if (filtros.busca) {
        const texto = normalizar(`${p.id} ${p.comprador} ${p.vendedor}`);
        if (!texto.includes(normalizar(filtros.busca))) return false;
      }
      return true;
    },
    href: (p) => `#/pedidos/${p.id}`,
  });

  return () => lista.destruir();
}