// Tela 4 — Detalhe da movimentação (RF-FIN-03 e RF-FIN-04): somente leitura.
import { selo } from '../../components/selo.js';
import { htmlCarregando, htmlErro } from '../../components/estados.js';
import { obterMovimentacao, STATUS_MOVIMENTACAO } from '../../modules/financeiro/dados.js';
import { formatarMoeda, formatarDataHora, esc } from '../../lib/format.js';

export function paginaFinanceiroDetalhe({ container, params }) {
  container.innerHTML = `
    <a class="voltar" href="#/financeiro">← Voltar para Financeiro</a>
    <div data-conteudo></div>`;
  const area = container.querySelector('[data-conteudo]');
  let ativo = true;

  async function carregar() {
    area.innerHTML = htmlCarregando(6);
    let m;
    try {
      m = await obterMovimentacao(params.id);
    } catch {
      if (ativo) area.innerHTML = htmlErro();
      return;
    }
    if (!ativo) return;

    if (!m) {
      area.innerHTML = `
        <div class="estado">
          <div class="estado__icone" aria-hidden="true">🔍</div>
          <p class="estado__titulo">Movimentação não encontrada</p>
          <p class="estado__texto">Não existe nenhuma movimentação com a referência ${esc(params.id)}.</p>
          <a class="btn" href="#/financeiro">Voltar para a lista</a>
        </div>`;
      return;
    }

    area.innerHTML = `
      <div class="pagina__topo" style="margin-bottom:18px">
        <div>
          <h1>Movimentação ${esc(m.id)}</h1>
          <p class="pagina__subtitulo">${esc(m.tipo)} · ${esc(formatarDataHora(m.data))}</p>
        </div>
        ${selo(m.status, STATUS_MOVIMENTACAO[m.status])}
      </div>

      <section class="cartao" aria-labelledby="titulo-dados">
        <h2 id="titulo-dados">Dados da movimentação</h2>
        <dl class="dados">
          <dt>Referência</dt><dd>${esc(m.id)}</dd>
          <dt>Tipo</dt><dd>${esc(m.tipo)}</dd>
          <dt>Valor</dt><dd>${formatarMoeda(m.valor)}</dd>
          <dt>Data e hora</dt><dd>${esc(formatarDataHora(m.data))}</dd>
          <dt>Pedido ligado</dt><dd>${esc(m.pedido)}</dd>
          <dt>Método de pagamento</dt><dd>${esc(m.metodo)}</dd>
          <dt>Status</dt><dd>${esc(m.status)}</dd>
        </dl>
        <p class="nota" style="margin-top:16px">
          Somente leitura: movimentações financeiras não podem ser editadas nem excluídas.
        </p>
      </section>`;
  }

  area.addEventListener('click', (evento) => {
    if (evento.target.closest('[data-acao="tentar-novo"]')) carregar();
  });

  carregar();
  return () => {
    ativo = false;
  };
}
