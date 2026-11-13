// Tela 13 — Locais: sugestões, reivindicações e edições, cada um em uma aba (RF-LOC-01).
import { montarAbas } from '../../components/abas.js';
import { montarLista } from '../../components/lista.js';
import { selo } from '../../components/selo.js';
import { listarLocais, STATUS_LOCAL } from '../../modules/locais/dados.js';
import { formatarDataHora, lerData, normalizar, esc } from '../../lib/format.js';

const DEZ_ANOS = 10 * 365 * 86400000;

function criarAba(tipo, nomeItens, rotuloNome) {
  return (painel) => {
    const lista = montarLista(painel, {
      chave: `locais-${tipo}`,
      nomeItens,
      filtros: [
        { nome: 'busca', tipo: 'texto', rotulo: 'Buscar', placeholder: 'Buscar por local, solicitante ou bairro…' },
        {
          nome: 'status', tipo: 'select', rotulo: 'Status', todos: 'Todos os status',
          opcoes: Object.entries(STATUS_LOCAL).map(([valor, s]) => ({ valor, rotulo: s.rotulo })),
        },
      ],
      colunas: [
        {
          chave: 'nome', rotulo: rotuloNome, ordenavel: true,
          render: (l) => `<a href="#/locais/${esc(l.id)}">${esc(l.nome)}</a><small>${esc(l.id)} · ${esc(l.bairro)}</small>`,
        },
        { chave: 'solicitante', rotulo: 'Solicitante', ordenavel: true, render: (l) => esc(l.solicitante) },
        {
          chave: 'enviadoEm', rotulo: 'Enviado em', ordenavel: true,
          // Pendentes primeiro: quem já foi decidido ganha 10 anos na ordenação.
          valorOrdem: (l) => lerData(l.enviadoEm).getTime() + (l.status === 'pendente' ? 0 : DEZ_ANOS),
          render: (l) => esc(formatarDataHora(l.enviadoEm)),
        },
        {
          chave: 'status', rotulo: 'Status', ordenavel: true,
          valorOrdem: (l) => STATUS_LOCAL[l.status].rotulo,
          render: (l) => selo(STATUS_LOCAL[l.status].rotulo, STATUS_LOCAL[l.status].variante),
        },
      ],
      ordemPadrao: { chave: 'enviadoEm', direcao: 'asc' },
      porPagina: 8,
      carregar: () => listarLocais(tipo),
      filtrar: (l, filtros) => {
        if (filtros.status && l.status !== filtros.status) return false;
        if (filtros.busca && !normalizar(`${l.nome} ${l.solicitante} ${l.bairro} ${l.id}`).includes(normalizar(filtros.busca))) return false;
        return true;
      },
      href: (l) => `#/locais/${l.id}`,
    });
    return () => lista.destruir();
  };
}

export function paginaLocais({ container }) {
  container.innerHTML = `
    <div class="pagina__topo">
      <div>
        <h1>Locais</h1>
        <p class="pagina__subtitulo">Pedidos de novos lugares, de responsáveis por lugares e de mudanças no mapa.</p>
      </div>
    </div>
    <div data-abas></div>`;

  const abas = montarAbas(container.querySelector('[data-abas]'), {
    chave: 'locais',
    padrao: 'sugestao',
    abas: [
      { id: 'sugestao', rotulo: 'Sugestões', montar: criarAba('sugestao', 'sugestões', 'Local sugerido') },
      { id: 'reivindicacao', rotulo: 'Reivindicações', montar: criarAba('reivindicacao', 'reivindicações', 'Local reivindicado') },
      { id: 'edicao', rotulo: 'Edições', montar: criarAba('edicao', 'edições', 'Local editado') },
    ],
  });
  return () => abas.destruir();
}
