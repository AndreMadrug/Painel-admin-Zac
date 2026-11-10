// Tela 3 — Financeiro (RF-FIN-01, RF-FIN-02 e RF-FIN-04).
import { montarLista } from '../../components/lista.js';
import { montarSeletorPeriodo, intervaloDoPeriodo } from '../../components/periodo.js';
import { selo } from '../../components/selo.js';
import {
  listarMovimentacoes,
  resumirPeriodo,
  TIPOS,
  STATUS_MOVIMENTACAO,
} from '../../modules/financeiro/dados.js';
import { formatarMoeda, formatarDataHora, lerData, normalizar, esc } from '../../lib/format.js';

function cartao(rotulo, valor, variante = '') {
  return `<div class="cartao-resumo ${variante}">
    <div class="cartao-resumo__rotulo">${esc(rotulo)}</div>
    <div class="cartao-resumo__valor">${formatarMoeda(valor)}</div>
  </div>`;
}

export function paginaFinanceiro({ container }) {
  container.innerHTML = `
    <div class="pagina__topo">
      <div>
        <h1>Financeiro</h1>
        <p class="pagina__subtitulo">Todo o dinheiro movimentado: vendas, taxas, repasses e doações.</p>
      </div>
      <div data-periodo></div>
    </div>

    <section aria-labelledby="titulo-resumo">
      <h2 id="titulo-resumo" class="sr-only">Resumo do período</h2>
      <div class="grade-cartoes" data-resumo></div>
    </section>

    <section aria-labelledby="titulo-lista">
      <h2 id="titulo-lista" style="margin-bottom:12px">Movimentações</h2>
      <div data-lista></div>
      <p class="nota" style="margin-top:12px">
        Valores em reais. As movimentações são somente para consulta: nada é editado nem excluído por esta tela.
      </p>
    </section>`;

  const areaResumo = container.querySelector('[data-resumo]');
  let movimentacoes = [];
  let intervalo = intervaloDoPeriodo();

  function atualizarResumo() {
    const r = resumirPeriodo(movimentacoes, intervalo.inicio, intervalo.fim);
    areaResumo.innerHTML = [
      cartao('Volume bruto', r.bruto),
      cartao('Taxas', r.taxas, 'cartao-resumo--escuro'),
      cartao('Repasses', r.repasses),
      cartao('Doações ao ISAC', r.doacoes, 'cartao-resumo--verde'),
      cartao('Reembolsos', r.reembolsos, 'cartao-resumo--coral'),
    ].join('');
  }

  const lista = montarLista(container.querySelector('[data-lista]'), {
    chave: 'financeiro',
    nomeItens: 'movimentações',
    filtros: [
      {
        nome: 'busca',
        tipo: 'texto',
        rotulo: 'Buscar movimentação',
        placeholder: 'Buscar por referência, pedido ou forma de pagamento…',
      },
      {
        nome: 'tipo',
        tipo: 'select',
        rotulo: 'Tipo de movimentação',
        todos: 'Todos os tipos',
        opcoes: TIPOS.map((t) => ({ valor: t, rotulo: t })),
      },
    ],
    colunas: [
      {
        chave: 'id',
        rotulo: 'Referência',
        ordenavel: true,
        render: (m) => `<a href="#/financeiro/${esc(m.id)}">${esc(m.id)}</a><small>${esc(m.pedido)}</small>`,
      },
      { chave: 'tipo', rotulo: 'Tipo', ordenavel: true, render: (m) => esc(m.tipo) },
      {
        chave: 'valor',
        rotulo: 'Valor',
        numerica: true,
        ordenavel: true,
        render: (m) => formatarMoeda(m.valor),
      },
      {
        chave: 'data',
        rotulo: 'Data',
        ordenavel: true,
        valorOrdem: (m) => lerData(m.data).getTime(),
        render: (m) => esc(formatarDataHora(m.data)),
      },
      {
        chave: 'status',
        rotulo: 'Status',
        ordenavel: true,
        render: (m) => selo(m.status, STATUS_MOVIMENTACAO[m.status]),
      },
    ],
    ordemPadrao: { chave: 'data', direcao: 'desc' },
    porPagina: 10,
    carregar: async () => {
      movimentacoes = await listarMovimentacoes();
      atualizarResumo();
      return movimentacoes;
    },
    filtrar: (m, filtros) => {
      const data = lerData(m.data);
      if (data < intervalo.inicio || data > intervalo.fim) return false;
      if (filtros.tipo && m.tipo !== filtros.tipo) return false;
      if (filtros.busca) {
        const texto = normalizar(`${m.id} ${m.pedido} ${m.tipo} ${m.metodo}`);
        if (!texto.includes(normalizar(filtros.busca))) return false;
      }
      return true;
    },
    href: (m) => `#/financeiro/${m.id}`,
  });

  montarSeletorPeriodo(container.querySelector('[data-periodo]'), () => {
    intervalo = intervaloDoPeriodo();
    atualizarResumo();
    lista.redesenhar();
  });

  return () => lista.destruir();
}
