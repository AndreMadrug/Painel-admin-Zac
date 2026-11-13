// Tela 18 — Suporte: lista de chamados com prioridade e status (RF-ISU-04).
import { montarLista } from '../../components/lista.js';
import { selo } from '../../components/selo.js';
import { listarChamados, PRIORIDADES, STATUS_CHAMADO } from '../../modules/suporte/dados.js';
import { formatarDataHora, lerData, normalizar, esc } from '../../lib/format.js';

/** Monta o conteúdo da aba "Suporte". Devolve a função de limpeza. */
export function abaSuporte(painel) {
  painel.innerHTML = `
    <div class="barra-acoes"><a class="btn" href="#/impacto-e-suporte/chamados/novo">+ Novo chamado</a></div>
    <div data-lista></div>`;

  const lista = montarLista(painel.querySelector('[data-lista]'), {
    chave: 'chamados',
    nomeItens: 'chamados',
    filtros: [
      { nome: 'busca', tipo: 'texto', rotulo: 'Buscar chamado', placeholder: 'Buscar por assunto, usuário ou número…' },
      {
        nome: 'status', tipo: 'select', rotulo: 'Status', todos: 'Todos os status',
        opcoes: Object.entries(STATUS_CHAMADO).map(([valor, s]) => ({ valor, rotulo: s.rotulo })),
      },
      {
        nome: 'prioridade', tipo: 'select', rotulo: 'Prioridade', todos: 'Todas as prioridades',
        opcoes: Object.entries(PRIORIDADES).map(([valor, p]) => ({ valor, rotulo: p.rotulo })),
      },
    ],
    colunas: [
      {
        chave: 'assunto', rotulo: 'Chamado', ordenavel: true,
        render: (c) => `<a href="#/impacto-e-suporte/chamados/${esc(c.id)}">${esc(c.assunto)}</a><small>${esc(c.id)} · ${esc(c.usuario.nome)}</small>`,
      },
      {
        chave: 'prioridade', rotulo: 'Prioridade', ordenavel: true,
        // Chamados encerrados vão para o fim quando se ordena por prioridade.
        valorOrdem: (c) => PRIORIDADES[c.prioridade].peso - (c.status === 'encerrado' ? 10 : 0),
        render: (c) => selo(PRIORIDADES[c.prioridade].rotulo, PRIORIDADES[c.prioridade].variante),
      },
      {
        chave: 'status', rotulo: 'Status', ordenavel: true,
        valorOrdem: (c) => STATUS_CHAMADO[c.status].rotulo,
        render: (c) => selo(STATUS_CHAMADO[c.status].rotulo, STATUS_CHAMADO[c.status].variante),
      },
      {
        chave: 'atualizadoEm', rotulo: 'Atualizado em', ordenavel: true,
        valorOrdem: (c) => lerData(c.atualizadoEm).getTime(),
        render: (c) => esc(formatarDataHora(c.atualizadoEm)),
      },
    ],
    ordemPadrao: { chave: 'prioridade', direcao: 'desc' },
    porPagina: 8,
    carregar: listarChamados,
    filtrar: (c, filtros) => {
      if (filtros.status && c.status !== filtros.status) return false;
      if (filtros.prioridade && c.prioridade !== filtros.prioridade) return false;
      if (filtros.busca && !normalizar(`${c.assunto} ${c.usuario.nome} ${c.id}`).includes(normalizar(filtros.busca))) return false;
      return true;
    },
    href: (c) => `#/impacto-e-suporte/chamados/${c.id}`,
  });
  return () => lista.destruir();
}
