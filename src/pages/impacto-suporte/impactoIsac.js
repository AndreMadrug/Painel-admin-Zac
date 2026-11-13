// Tela 17 — Impacto ISAC: ações apoiadas, indicadores e doações do checkout (RF-ISU-01 a RF-ISU-03).
import { montarSeletorPeriodo, intervaloDoPeriodo, descreverPeriodo } from '../../components/periodo.js';
import { selo } from '../../components/selo.js';
import { htmlCarregando, htmlErro } from '../../components/estados.js';
import { confirmarAcao } from '../../components/confirmacao.js';
import { abrirFormulario } from '../../components/modalFormulario.js';
import { mostrarAviso } from '../../components/aviso.js';
import {
  listarAcoes, listarDoacoes, criarAcao, editarAcao, encerrarAcao, STATUS_ACAO,
} from '../../modules/impacto/dados.js';
import { formatarMoeda, formatarNumero, formatarData, lerData, esc } from '../../lib/format.js';

const camposDaAcao = (a = {}) => [
  { nome: 'nome', rotulo: 'Nome da ação', valor: a.nome, maxLength: 60 },
  { nome: 'descricao', rotulo: 'Descrição', tipo: 'textarea', valor: a.descricao, maxLength: 200 },
  { nome: 'meta', rotulo: 'Meta de arrecadação (R$)', tipo: 'numero', valor: a.meta, min: 1, max: 1000000 },
  { nome: 'indicadorRotulo', rotulo: 'Indicador de impacto', valor: a.indicador?.rotulo, maxLength: 40, dica: 'Ex.: mudas plantadas, kg de lixo retirados.' },
  { nome: 'indicadorValor', rotulo: 'Valor do indicador', tipo: 'numero', valor: a.indicador?.valor, min: 0, max: 100000000 },
];

/** Monta o conteúdo da aba "Impacto ISAC". Devolve a função de limpeza. */
export function abaImpacto(painel) {
  painel.innerHTML = `
    <div data-periodo style="margin-bottom:16px"></div>
    <div data-corpo></div>`;
  const corpo = painel.querySelector('[data-corpo]');
  let acoes = [];
  let doacoes = [];
  let filtroAcao = '';
  let ativo = true;

  function doacoesDoPeriodo() {
    const { inicio, fim } = intervaloDoPeriodo();
    return doacoes.filter((d) => {
      const data = lerData(d.data);
      return data >= inicio && data <= fim && (!filtroAcao || d.acaoId === filtroAcao);
    });
  }

  function htmlDoacoes() {
    const lista = doacoesDoPeriodo().sort((a, b) => lerData(b.data) - lerData(a.data));
    const total = lista.reduce((soma, d) => soma + d.valor, 0);
    const opcoes = acoes
      .map((a) => `<option value="${esc(a.id)}"${a.id === filtroAcao ? ' selected' : ''}>${esc(a.nome)}</option>`)
      .join('');
    const linhas = lista
      .map(
        (d) => `<tr><td>${esc(formatarData(d.data))}</td><td>${esc(d.acaoNome)}</td>
          <td>${esc(d.pedido)}</td><td class="num">${formatarMoeda(d.valor)}</td></tr>`
      )
      .join('');
    return `
      <div class="filtros" style="margin-bottom:12px">
        <div><label class="sr-only" for="filtro-doacao-acao">Ação</label>
        <select id="filtro-doacao-acao" data-filtro-acao><option value="">Todas as ações</option>${opcoes}</select></div>
      </div>
      ${
        lista.length
          ? `<div class="tabela-rolagem"><table class="tabela">
              <thead><tr><th scope="col"><span>Data</span></th><th scope="col"><span>Ação</span></th><th scope="col"><span>Pedido</span></th><th scope="col" class="num"><span>Valor</span></th></tr></thead>
              <tbody>${linhas}</tbody>
              <tfoot><tr><th scope="row" colspan="3">Total no período (${lista.length} ${lista.length === 1 ? 'doação' : 'doações'})</th><td class="num" data-total-doacoes><strong>${formatarMoeda(total)}</strong></td></tr></tfoot>
            </table></div>`
          : `<div class="estado"><div class="estado__icone" aria-hidden="true">🔍</div>
              <p class="estado__titulo">Nenhuma doação no período</p>
              <p class="estado__texto">Escolha outro período ou outra ação.</p></div>`
      }`;
  }

  function htmlAcoes() {
    const linhas = acoes
      .map((a) => {
        const pct = Math.min(100, Math.round((a.arrecadado / a.meta) * 100));
        const status = STATUS_ACAO[a.status];
        const botoes =
          a.status === 'ativa'
            ? `<button class="btn btn--neutro" type="button" data-acao="editar" data-id="${esc(a.id)}">Editar</button>
               <button class="btn btn--perigo" type="button" data-acao="encerrar" data-id="${esc(a.id)}">Encerrar</button>`
            : '<span class="nota">Sem ações</span>';
        return `<tr>
          <td><strong>${esc(a.nome)}</strong><small>${esc(a.id)}</small></td>
          <td>${formatarNumero(a.indicador.valor)} ${esc(a.indicador.rotulo)}</td>
          <td class="num">${formatarMoeda(a.arrecadado)}<small>de ${formatarMoeda(a.meta)} (${pct}%)</small>
            <div class="barra" role="img" aria-label="${pct}% da meta"><span style="width:${pct}%"></span></div></td>
          <td>${selo(status.rotulo, status.variante)}</td>
          <td><div class="acoes">${botoes}</div></td>
        </tr>`;
      })
      .join('');
    return `<div class="tabela-rolagem"><table class="tabela">
      <thead><tr><th scope="col"><span>Ação apoiada</span></th><th scope="col"><span>Indicador de impacto</span></th>
      <th scope="col" class="num"><span>Arrecadado</span></th><th scope="col"><span>Status</span></th><th scope="col"><span>Ações</span></th></tr></thead>
      <tbody>${linhas}</tbody></table></div>`;
  }

  function desenhar() {
    const ativas = acoes.filter((a) => a.status === 'ativa').length;
    const totalArrecadado = acoes.reduce((s, a) => s + a.arrecadado, 0);
    const noPeriodo = doacoesDoPeriodo().reduce((s, d) => s + d.valor, 0);
    corpo.innerHTML = `
      <div class="grade-cartoes" style="margin-bottom:18px">
        <div class="cartao-resumo cartao-resumo--verde"><div class="cartao-resumo__rotulo">Doações no período</div>
          <div class="cartao-resumo__valor">${formatarMoeda(noPeriodo)}</div><div class="cartao-resumo__nota">${esc(descreverPeriodo())}</div></div>
        <div class="cartao-resumo"><div class="cartao-resumo__rotulo">Total arrecadado pelas ações</div>
          <div class="cartao-resumo__valor">${formatarMoeda(totalArrecadado)}</div></div>
        <div class="cartao-resumo cartao-resumo--escuro"><div class="cartao-resumo__rotulo">Ações ativas</div>
          <div class="cartao-resumo__valor">${ativas}</div></div>
      </div>
      <section class="cartao" aria-labelledby="titulo-acoes">
        <div class="cartao__topo"><h2 id="titulo-acoes">Ações apoiadas</h2>
          <button class="btn" type="button" data-acao="nova">+ Nova ação</button></div>
        ${htmlAcoes()}
      </section>
      <section class="cartao" aria-labelledby="titulo-doacoes">
        <h2 id="titulo-doacoes">Doações do checkout</h2>
        <div data-doacoes>${htmlDoacoes()}</div>
      </section>`;
  }

  async function carregar() {
    corpo.innerHTML = htmlCarregando(8);
    try {
      [acoes, doacoes] = await Promise.all([listarAcoes(), listarDoacoes()]);
    } catch {
      if (ativo) corpo.innerHTML = htmlErro();
      return;
    }
    if (ativo) desenhar();
  }

  async function executar(promessa, titulo, texto) {
    corpo.querySelectorAll('button').forEach((b) => (b.disabled = true));
    try {
      await promessa();
      mostrarAviso({ titulo, texto });
    } catch {
      mostrarAviso({ tipo: 'erro', titulo: 'Não foi possível concluir', texto: 'Tente de novo em instantes.' });
    }
    if (ativo) await carregar();
  }

  async function nova() {
    const valores = await abrirFormulario({ titulo: 'Nova ação apoiada', campos: camposDaAcao(), rotuloConfirmar: 'Cadastrar' });
    if (!valores || !ativo) return;
    await executar(() => criarAcao(valores), 'Ação cadastrada', `"${valores.nome}" já aparece na lista.`);
  }

  async function editar(id) {
    const acao = acoes.find((a) => a.id === id);
    const valores = await abrirFormulario({ titulo: 'Editar ação', campos: camposDaAcao(acao), rotuloConfirmar: 'Salvar' });
    if (!valores || !ativo) return;
    await executar(() => editarAcao(id, valores), 'Ação atualizada', `"${valores.nome}" foi salva.`);
  }

  async function encerrar(id) {
    const acao = acoes.find((a) => a.id === id);
    const resposta = await confirmarAcao({
      titulo: 'Encerrar esta ação?',
      texto: `"${acao.nome}" deixa de receber doações do checkout. Isso não pode ser desfeito.`,
      rotuloConfirmar: 'Encerrar ação',
      variante: 'perigo',
    });
    if (!resposta || !ativo) return;
    await executar(() => encerrarAcao(id), 'Ação encerrada', `"${acao.nome}" foi encerrada.`);
  }

  corpo.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-acao]');
    if (!botao) return;
    const { acao, id } = botao.dataset;
    if (acao === 'tentar-novo') carregar();
    else if (acao === 'nova') nova();
    else if (acao === 'editar') editar(id);
    else if (acao === 'encerrar') encerrar(id);
  });
  corpo.addEventListener('change', (evento) => {
    if (!evento.target.matches('[data-filtro-acao]')) return;
    filtroAcao = evento.target.value;
    desenhar();
    corpo.querySelector('[data-filtro-acao]').focus();
  });

  montarSeletorPeriodo(painel.querySelector('[data-periodo]'), () => ativo && acoes.length && desenhar());
  carregar();
  return () => {
    ativo = false;
  };
}
