// Tela — Produtos e denúncias: lista com duas abas.
import { montarAbas } from '../../components/abas.js';
import { montarLista } from '../../components/lista.js';
import { selo } from '../../components/selo.js';
import {
  listarProdutos,
  listarDenuncias,
  STATUS_PRODUTO,
  STATUS_DENUNCIA,
  MOTIVOS_DENUNCIA,
} from '../../modules/produtos/dados.js';
import { formatarMoeda, formatarData, lerData, normalizar, esc } from '../../lib/format.js';

const BASE = '#/produtos-e-denuncias';

function abaProdutos(painel) {
  const lista = montarLista(painel, {
    chave: 'produtos',
    nomeItens: 'produtos',
    filtros: [
      { nome: 'busca', tipo: 'texto', rotulo: 'Buscar produto', placeholder: 'Buscar por nome, vendedor ou categoria…' },
      {
        nome: 'status', tipo: 'select', rotulo: 'Status do produto', todos: 'Todos os status',
        opcoes: Object.entries(STATUS_PRODUTO).map(([valor, s]) => ({ valor, rotulo: s.rotulo })),
      },
    ],
    colunas: [
      {
        chave: 'nome', rotulo: 'Produto', ordenavel: true,
        render: (p) => `<a href="${BASE}/produtos/${esc(p.id)}">${esc(p.nome)}</a><small>${esc(p.id)}</small>`,
      },
      { chave: 'vendedor', rotulo: 'Vendedor', ordenavel: true, render: (p) => esc(p.vendedor) },
      { chave: 'preco', rotulo: 'Preço', numerica: true, ordenavel: true, render: (p) => formatarMoeda(p.preco) },
      { chave: 'estoque', rotulo: 'Estoque', numerica: true, ordenavel: true, render: (p) => String(p.estoque) },
      {
        chave: 'status', rotulo: 'Status', ordenavel: true,
        valorOrdem: (p) => STATUS_PRODUTO[p.status].rotulo,
        render: (p) => selo(STATUS_PRODUTO[p.status].rotulo, STATUS_PRODUTO[p.status].variante),
      },
    ],
    ordemPadrao: { chave: 'nome', direcao: 'asc' },
    porPagina: 8,
    carregar: listarProdutos,
    filtrar: (p, filtros) => {
      if (filtros.status && p.status !== filtros.status) return false;
      if (filtros.busca && !normalizar(`${p.nome} ${p.vendedor} ${p.categoria} ${p.id}`).includes(normalizar(filtros.busca))) return false;
      return true;
    },
    href: (p) => `${BASE}/produtos/${p.id}`,
  });
  return () => lista.destruir();
}

function abaDenuncias(painel) {
  const lista = montarLista(painel, {
    chave: 'denuncias',
    nomeItens: 'denúncias',
    filtros: [
      { nome: 'busca', tipo: 'texto', rotulo: 'Buscar denúncia', placeholder: 'Buscar por número, conteúdo ou denunciante…' },
      {
        nome: 'status', tipo: 'select', rotulo: 'Status da denúncia', todos: 'Todos os status',
        opcoes: Object.entries(STATUS_DENUNCIA).map(([valor, s]) => ({ valor, rotulo: s.rotulo })),
      },
      {
        nome: 'motivo', tipo: 'select', rotulo: 'Motivo', todos: 'Todos os motivos',
        opcoes: MOTIVOS_DENUNCIA.map((m) => ({ valor: m, rotulo: m })),
      },
    ],
    colunas: [
      {
        chave: 'id', rotulo: 'Denúncia', ordenavel: true,
        render: (d) => `<a href="${BASE}/denuncias/${esc(d.id)}">${esc(d.id)}</a><small>${esc(d.alvoTipo)}</small>`,
      },
      { chave: 'motivo', rotulo: 'Motivo', ordenavel: true, render: (d) => esc(d.motivo) },
      { chave: 'alvoNome', rotulo: 'Conteúdo denunciado', ordenavel: true, render: (d) => esc(d.alvoNome) },
      {
        chave: 'abertaEm', rotulo: 'Aberta em', ordenavel: true,
        valorOrdem: (d) => lerData(d.abertaEm).getTime(),
        render: (d) => esc(formatarData(d.abertaEm)),
      },
      {
        chave: 'status', rotulo: 'Status', ordenavel: true,
        valorOrdem: (d) => STATUS_DENUNCIA[d.status].rotulo,
        render: (d) => selo(STATUS_DENUNCIA[d.status].rotulo, STATUS_DENUNCIA[d.status].variante),
      },
    ],
    ordemPadrao: { chave: 'abertaEm', direcao: 'desc' },
    porPagina: 8,
    carregar: listarDenuncias,
    filtrar: (d, filtros) => {
      if (filtros.status && d.status !== filtros.status) return false;
      if (filtros.motivo && d.motivo !== filtros.motivo) return false;
      if (filtros.busca && !normalizar(`${d.id} ${d.alvoNome} ${d.denunciante} ${d.motivo}`).includes(normalizar(filtros.busca))) return false;
      return true;
    },
    href: (d) => `${BASE}/denuncias/${d.id}`,
  });
  return () => lista.destruir();
}

export function paginaProdutosDenuncias({ container }) {
  container.innerHTML = `
    <div class="pagina__topo">
      <div>
        <h1>Produtos e denúncias</h1>
        <p class="pagina__subtitulo">Anúncios da plataforma e denúncias que pedem decisão.</p>
      </div>
    </div>
    <div data-abas></div>`;

  const abas = montarAbas(container.querySelector('[data-abas]'), {
    chave: 'produtos-e-denuncias',
    padrao: 'produtos',
    abas: [
      { id: 'produtos', rotulo: 'Produtos', montar: abaProdutos },
      { id: 'denuncias', rotulo: 'Denúncias', montar: abaDenuncias },
    ],
  });

  return () => abas.destruir();
}