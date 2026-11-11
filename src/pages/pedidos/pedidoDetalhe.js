// Tela — Detalhe do pedido: itens, endereço, valores, linha do tempo e atalhos (somente consulta).
import { selo } from '../../components/selo.js';
import { htmlCarregando, htmlErro } from '../../components/estados.js';
import { obterPedido, obterAtalhos, STATUS } from '../../modules/pedidos/dados.js';
import { formatarMoeda, formatarDataHora, esc } from '../../lib/format.js';

function htmlItens(pedido) {
  const linhas = pedido.itens
    .map(
      (i) => `<tr>
        <td>${esc(i.nome)}</td>
        <td class="num">${i.quantidade}</td>
        <td class="num">${formatarMoeda(i.preco)}</td>
        <td class="num">${formatarMoeda(i.quantidade * i.preco)}</td>
      </tr>`
    )
    .join('');
  return `
    <div class="tabela-rolagem">
      <table class="tabela">
        <thead><tr>
          <th scope="col">Item</th><th scope="col" class="num">Qtd.</th>
          <th scope="col" class="num">Preço</th><th scope="col" class="num">Subtotal</th>
        </tr></thead>
        <tbody>${linhas}</tbody>
      </table>
    </div>`;
}

function htmlLinhaDoTempo(pedido) {
  const passos = pedido.linhaDoTempo
    .map(
      (p) => `<li>
        <strong>${esc(p.rotulo)}</strong>
        <small class="nota" style="display:block">${esc(formatarDataHora(p.em))}</small>
      </li>`
    )
    .join('');
  return `<ol class="linha-tempo">${passos}</ol>`;
}

function htmlAtalhos(atalhos) {
  const botoes = [];
  if (atalhos.pagamento) {
    botoes.push(`<a class="btn" href="#/financeiro/${esc(atalhos.pagamento.id)}">Ver pagamento (${esc(atalhos.pagamento.id)})</a>`);
  }
  if (atalhos.disputa) {
    botoes.push(`<a class="btn" href="#/disputas/${esc(atalhos.disputa.id)}">Ver disputa (${esc(atalhos.disputa.id)})</a>`);
  }
  if (!botoes.length) return '<p class="nota">Este pedido não tem pagamento nem disputa para mostrar.</p>';
  return `<div class="acoes">${botoes.join('')}</div>`;
}

export function paginaPedidoDetalhe({ container, params }) {
  container.innerHTML = `
    <a class="voltar" href="#/pedidos">← Voltar para Pedidos</a>
    <div data-conteudo class="pagina" style="padding:0"></div>`;
  const area = container.querySelector('[data-conteudo]');
  let ativo = true;

  function desenhar(pedido, atalhos) {
    const status = STATUS[pedido.status];
    area.innerHTML = `
      <div class="pagina__topo">
        <div>
          <h1>Pedido ${esc(pedido.id)}</h1>
          <p class="pagina__subtitulo">Feito em ${esc(formatarDataHora(pedido.criadoEm))}</p>
        </div>
        ${selo(status.rotulo, status.variante)}
      </div>

      <div class="detalhe-grade">
        <section class="cartao" aria-labelledby="titulo-partes">
          <h2 id="titulo-partes">Partes envolvidas</h2>
          <dl class="dados">
            <dt>Comprador</dt><dd>${esc(pedido.comprador)}</dd>
            <dt>Vendedor</dt><dd>${esc(pedido.vendedor)}</dd>
          </dl>
        </section>

        <section class="cartao" aria-labelledby="titulo-endereco">
          <h2 id="titulo-endereco">Endereço de entrega</h2>
          <dl class="dados">
            <dt>Rua</dt><dd>${esc(pedido.endereco.rua)}</dd>
            <dt>Bairro</dt><dd>${esc(pedido.endereco.bairro)}</dd>
            <dt>Cidade</dt><dd>${esc(pedido.endereco.cidade)}</dd>
          </dl>
        </section>

        <section class="cartao" aria-labelledby="titulo-valores">
          <h2 id="titulo-valores">Valores</h2>
          <dl class="dados">
            <dt>Itens</dt><dd>${formatarMoeda(pedido.subtotal)}</dd>
            <dt>Frete</dt><dd>${formatarMoeda(pedido.frete)}</dd>
            <dt>Total</dt><dd><strong>${formatarMoeda(pedido.total)}</strong></dd>
            <dt>Forma de pagamento</dt><dd>${esc(pedido.pagamento.metodo)}</dd>
            <dt>Situação</dt><dd>${esc(pedido.pagamento.status)}</dd>
          </dl>
        </section>

        <section class="cartao" aria-labelledby="titulo-tempo">
          <h2 id="titulo-tempo">Linha do tempo</h2>
          ${htmlLinhaDoTempo(pedido)}
        </section>
      </div>

      <section class="cartao" aria-labelledby="titulo-itens">
        <h2 id="titulo-itens">Itens do pedido</h2>
        ${htmlItens(pedido)}
      </section>

      <section class="cartao" aria-labelledby="titulo-atalhos">
        <h2 id="titulo-atalhos">Atalhos</h2>
        ${htmlAtalhos(atalhos)}
      </section>`;
  }

  async function carregar() {
    area.innerHTML = htmlCarregando(8);
    let pedido;
    let atalhos;
    try {
      pedido = await obterPedido(params.id);
      atalhos = pedido ? await obterAtalhos(pedido.id) : null;
    } catch {
      if (ativo) area.innerHTML = htmlErro();
      return;
    }
    if (!ativo) return;

    if (!pedido) {
      area.innerHTML = `
        <div class="estado">
          <div class="estado__icone" aria-hidden="true">🔍</div>
          <p class="estado__titulo">Pedido não encontrado</p>
          <p class="estado__texto">Não existe nenhum pedido com o número ${esc(params.id)}.</p>
          <a class="btn" href="#/pedidos">Voltar para a lista</a>
        </div>`;
      return;
    }
    desenhar(pedido, atalhos);
  }

  area.addEventListener('click', (evento) => {
    if (evento.target.closest('[data-acao="tentar-novo"]')) carregar();
  });

  carregar();
  return () => {
    ativo = false;
  };
}