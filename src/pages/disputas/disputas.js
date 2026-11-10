// Tela 5 — Disputas e reembolsos: fila com status e prazo (RF-DSP-01 e RF-DSP-02).
import { montarLista } from '../../components/lista.js';
import { selo } from '../../components/selo.js';
import { listarDisputas, STATUS } from '../../modules/disputas/dados.js';
import { formatarMoeda, formatarData, lerData, diasAte, normalizar, esc } from '../../lib/format.js';

const DEZ_ANOS = 10 * 365 * 86400000;
const emAberto = (disputa) => disputa.status === 'aberta' || disputa.status === 'em_analise';

/** Prazo com destaque em coral quando está vencido ou perto de vencer (RF-DSP-02). */
function celulaPrazo(disputa) {
  const dias = diasAte(disputa.prazo);
  const data = esc(formatarData(disputa.prazo));

  if (!emAberto(disputa) || dias > 2) return data;

  const texto = dias < 0 ? 'Vencido' : dias === 0 ? 'Vence hoje' : `Vence em ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
  return `<span class="prazo-urgente">${data}</span><div>${selo(texto, 'coral')}</div>`;
}

export function paginaDisputas({ container }) {
  container.innerHTML = `
    <div class="pagina__topo">
      <div>
        <h1>Disputas e reembolsos</h1>
        <p class="pagina__subtitulo">Fila para analisar, aprovar ou negar e reembolsar.</p>
      </div>
    </div>
    <div data-lista></div>`;

  const lista = montarLista(container.querySelector('[data-lista]'), {
    chave: 'disputas',
    nomeItens: 'disputas',
    filtros: [
      {
        nome: 'busca',
        tipo: 'texto',
        rotulo: 'Buscar disputa',
        placeholder: 'Buscar por número, pedido, motivo ou nome…',
      },
      {
        nome: 'status',
        tipo: 'select',
        rotulo: 'Status',
        todos: 'Todos os status',
        opcoes: Object.entries(STATUS).map(([valor, s]) => ({ valor, rotulo: s.rotulo })),
      },
    ],
    colunas: [
      {
        chave: 'id',
        rotulo: 'Disputa',
        ordenavel: true,
        render: (d) => `<a href="#/disputas/${esc(d.id)}">${esc(d.id)}</a><small>${esc(d.pedido)}</small>`,
      },
      { chave: 'motivo', rotulo: 'Motivo', ordenavel: true, render: (d) => esc(d.motivo) },
      {
        chave: 'comprador',
        rotulo: 'Partes',
        ordenavel: true,
        render: (d) => `${esc(d.comprador)}<small>vendedor: ${esc(d.vendedor)}</small>`,
      },
      {
        chave: 'valorPedido',
        rotulo: 'Valor',
        numerica: true,
        ordenavel: true,
        render: (d) => formatarMoeda(d.valorPedido),
      },
      {
        chave: 'prazo',
        rotulo: 'Prazo',
        ordenavel: true,
        // Disputas já decididas vão para o fim da fila: o que está em aberto aparece primeiro.
        valorOrdem: (d) => lerData(d.prazo).getTime() + (emAberto(d) ? 0 : DEZ_ANOS),
        render: celulaPrazo,
      },
      {
        chave: 'status',
        rotulo: 'Status',
        ordenavel: true,
        valorOrdem: (d) => STATUS[d.status].rotulo,
        render: (d) => selo(STATUS[d.status].rotulo, STATUS[d.status].variante),
      },
    ],
    ordemPadrao: { chave: 'prazo', direcao: 'asc' },
    porPagina: 8,
    carregar: listarDisputas,
    filtrar: (d, filtros) => {
      if (filtros.status && d.status !== filtros.status) return false;
      if (filtros.busca) {
        const texto = normalizar(`${d.id} ${d.pedido} ${d.motivo} ${d.comprador} ${d.vendedor}`);
        if (!texto.includes(normalizar(filtros.busca))) return false;
      }
      return true;
    },
    href: (d) => `#/disputas/${d.id}`,
  });

  return () => lista.destruir();
}
