// Tela 21 (parte 2) — Auditoria: histórico de ações, somente para consulta (RF-SIS-02).
import { montarLista } from '../../components/lista.js';
import { selo } from '../../components/selo.js';
import { listarAuditoria, MODULOS_AUDITORIA } from '../../modules/sistema/dados.js';
import { formatarDataHora, lerData, diasAPartirDeHoje, normalizar, esc } from '../../lib/format.js';

const PERIODOS = { hoje: 0, '7d': 6, '30d': 29 };

/** Monta o conteúdo da aba "Auditoria". Devolve a função de limpeza. */
export function abaAuditoria(painel) {
  painel.classList.add('auditoria');
  const lista = montarLista(painel, {
    chave: 'auditoria',
    nomeItens: 'registros',
    filtros: [
      { nome: 'busca', tipo: 'texto', rotulo: 'Buscar no histórico', placeholder: 'Buscar por ação, alvo ou detalhe…' },
      {
        nome: 'modulo', tipo: 'select', rotulo: 'Módulo', todos: 'Todos os módulos',
        opcoes: MODULOS_AUDITORIA.map((m) => ({ valor: m, rotulo: m })),
      },
      {
        nome: 'ator', tipo: 'select', rotulo: 'Quem fez', todos: 'Todas as pessoas',
        opcoes: [{ valor: 'André', rotulo: 'André' }, { valor: 'Maria Eduarda', rotulo: 'Maria Eduarda' }],
      },
      {
        nome: 'periodo', tipo: 'select', rotulo: 'Período', todos: 'Todo o histórico',
        opcoes: [{ valor: 'hoje', rotulo: 'Hoje' }, { valor: '7d', rotulo: 'Últimos 7 dias' }, { valor: '30d', rotulo: 'Últimos 30 dias' }],
      },
    ],
    colunas: [
      {
        chave: 'quando', rotulo: 'Quando', ordenavel: true,
        valorOrdem: (r) => lerData(r.quando).getTime(),
        render: (r) => esc(formatarDataHora(r.quando)),
      },
      { chave: 'ator', rotulo: 'Quem', ordenavel: true, render: (r) => esc(r.ator) },
      { chave: 'modulo', rotulo: 'Módulo', ordenavel: true, render: (r) => selo(r.modulo, 'neutro') },
      {
        chave: 'acao', rotulo: 'O que foi feito', ordenavel: true,
        render: (r) => `${esc(r.acao)}<small>${esc(r.alvo)} · ${esc(r.detalhe)}</small>`,
      },
    ],
    ordemPadrao: { chave: 'quando', direcao: 'desc' },
    porPagina: 10,
    carregar: listarAuditoria,
    filtrar: (r, filtros) => {
      if (filtros.modulo && r.modulo !== filtros.modulo) return false;
      if (filtros.ator && r.ator !== filtros.ator) return false;
      if (filtros.periodo && lerData(r.quando) < diasAPartirDeHoje(-PERIODOS[filtros.periodo])) return false;
      if (filtros.busca && !normalizar(`${r.acao} ${r.alvo} ${r.detalhe} ${r.ator}`).includes(normalizar(filtros.busca))) return false;
      return true;
    },
    // Auditoria é só consulta: as linhas não abrem nenhuma tela.
    href: () => '#/sistema',
  });
  return () => {
    painel.classList.remove('auditoria');
    lista.destruir();
  };
}
