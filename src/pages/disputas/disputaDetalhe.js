// Tela 6 — Detalhe da disputa (RF-DSP-03, RF-DSP-04 e RF-DSP-05).
// Fluxo: ler os dados -> aprovar ou negar (com justificativa) -> reembolso total ou parcial.
import { selo } from '../../components/selo.js';
import { htmlCarregando, htmlErro } from '../../components/estados.js';
import { confirmarAcao } from '../../components/confirmacao.js';
import { mostrarAviso } from '../../components/aviso.js';
import { obterDisputa, decidirDisputa, registrarReembolso, STATUS } from '../../modules/disputas/dados.js';
import { formatarMoeda, formatarData, formatarDataHora, diasAte, esc } from '../../lib/format.js';

function htmlEvidencias(evidencias) {
  if (!evidencias.length) return '<p class="nota">Nenhuma evidência foi enviada.</p>';
  const itens = evidencias
    .map(
      (e) => `<li class="evidencia">
        <span class="evidencia__icone" aria-hidden="true">${e.tipo === 'imagem' ? '🖼️' : '📄'}</span>
        <span>${esc(e.nome)}<small class="nota" style="display:block">${e.tipo === 'imagem' ? 'Imagem' : 'Arquivo'} de exemplo</small></span>
      </li>`
    )
    .join('');
  return `<ul class="lista-evidencias">${itens}</ul>`;
}

function htmlPrazo(disputa) {
  const emAberto = disputa.status === 'aberta' || disputa.status === 'em_analise';
  const dias = diasAte(disputa.prazo);
  const data = formatarData(disputa.prazo);
  if (!emAberto) return esc(data);
  if (dias < 0) return `${esc(data)} ${selo('Vencido', 'coral')}`;
  if (dias <= 2) return `${esc(data)} ${selo(dias === 0 ? 'Vence hoje' : `Vence em ${dias} ${dias === 1 ? 'dia' : 'dias'}`, 'coral')}`;
  return esc(data);
}

function htmlDecisao(disputa) {
  const emAberto = disputa.status === 'aberta' || disputa.status === 'em_analise';

  if (emAberto) {
    return `
      <p class="nota" style="margin-bottom:14px">Leia os dados acima e escolha uma ação. A justificativa é obrigatória.</p>
      <div class="acoes">
        <button class="btn btn--positivo" type="button" data-acao="aprovar">Aprovar</button>
        <button class="btn btn--perigo" type="button" data-acao="negar">Negar</button>
      </div>`;
  }

  const decisao = disputa.decisao;
  return `
    <dl class="dados">
      <dt>Decisão</dt><dd>${decisao.tipo === 'aprovada' ? 'Aprovada' : 'Negada'}</dd>
      <dt>Data</dt><dd>${esc(formatarDataHora(decisao.em))}</dd>
      <dt>Justificativa</dt><dd>${esc(decisao.justificativa)}</dd>
    </dl>`;
}

function htmlReembolso(disputa) {
  if (disputa.status !== 'reembolso') return '';

  if (disputa.reembolso) {
    const r = disputa.reembolso;
    return `
      <section class="cartao" aria-labelledby="titulo-reembolso">
        <h2 id="titulo-reembolso">Reembolso</h2>
        <dl class="dados">
          <dt>Tipo</dt><dd>${esc(r.tipo)}</dd>
          <dt>Valor reembolsado</dt><dd>${formatarMoeda(r.valor)}</dd>
          <dt>Status do reembolso</dt><dd>${selo(r.status, 'verde')}</dd>
        </dl>
      </section>`;
  }

  return `
    <section class="cartao" aria-labelledby="titulo-reembolso">
      <h2 id="titulo-reembolso">Reembolso</h2>
      <p class="nota" style="margin-bottom:14px">
        A disputa foi aprovada. Informe se o reembolso é total ou parcial.
        Valor do pedido: ${formatarMoeda(disputa.valorPedido)}.
      </p>
      <form class="bloco-reembolso" data-form-reembolso novalidate>
        <fieldset style="border:0;padding:0;margin:0">
          <legend class="sr-only">Tipo de reembolso</legend>
          <div class="opcoes">
            <label><input type="radio" name="tipo" value="Total" checked /> Total</label>
            <label><input type="radio" name="tipo" value="Parcial" /> Parcial</label>
          </div>
        </fieldset>
        <label class="campo">
          <span>Valor a reembolsar (R$)</span>
          <input type="number" name="valor" step="0.01" min="0.01" max="${disputa.valorPedido}"
                 value="${disputa.valorPedido.toFixed(2)}" readonly aria-describedby="erro-valor" />
          <span class="campo__erro" id="erro-valor" role="alert"></span>
        </label>
        <div><button class="btn btn--positivo" type="submit">Reembolsar</button></div>
      </form>
    </section>`;
}

export function paginaDisputaDetalhe({ container, params }) {
  container.innerHTML = `
    <a class="voltar" href="#/disputas">← Voltar para Disputas e reembolsos</a>
    <div data-conteudo class="pagina" style="padding:0"></div>`;
  const area = container.querySelector('[data-conteudo]');
  let disputa = null;
  let ativo = true;

  function desenhar() {
    const status = STATUS[disputa.status];
    area.innerHTML = `
      <div class="pagina__topo">
        <div>
          <h1>Disputa ${esc(disputa.id)}</h1>
          <p class="pagina__subtitulo">Aberta em ${esc(formatarDataHora(disputa.abertaEm))} · Pedido ${esc(disputa.pedido)}</p>
        </div>
        ${selo(status.rotulo, status.variante)}
      </div>

      <div class="detalhe-grade">
        <section class="cartao" aria-labelledby="titulo-motivo">
          <h2 id="titulo-motivo">Motivo</h2>
          <p><strong>${esc(disputa.motivo)}</strong></p>
          <p class="nota" style="margin:6px 0 14px">${esc(disputa.descricao)}</p>
          <dl class="dados"><dt>Prazo</dt><dd>${htmlPrazo(disputa)}</dd></dl>
        </section>

        <section class="cartao" aria-labelledby="titulo-pedido">
          <h2 id="titulo-pedido">Pedido e pagamento</h2>
          <dl class="dados">
            <dt>Pedido</dt><dd>${esc(disputa.pedido)}</dd>
            <dt>Valor do pedido</dt><dd>${formatarMoeda(disputa.valorPedido)}</dd>
            <dt>Forma de pagamento</dt><dd>${esc(disputa.pagamento.metodo)}</dd>
            <dt>Situação</dt><dd>${esc(disputa.pagamento.status)}</dd>
          </dl>
        </section>

        <section class="cartao" aria-labelledby="titulo-partes">
          <h2 id="titulo-partes">Partes envolvidas</h2>
          <dl class="dados">
            <dt>Comprador</dt><dd>${esc(disputa.comprador)}</dd>
            <dt>Vendedor</dt><dd>${esc(disputa.vendedor)}</dd>
          </dl>
        </section>

        <section class="cartao" aria-labelledby="titulo-evidencias">
          <h2 id="titulo-evidencias">Evidências</h2>
          ${htmlEvidencias(disputa.evidencias)}
        </section>
      </div>

      <section class="cartao" aria-labelledby="titulo-decisao">
        <h2 id="titulo-decisao">Decisão</h2>
        ${htmlDecisao(disputa)}
      </section>

      ${htmlReembolso(disputa)}`;
  }

  async function carregar() {
    area.innerHTML = htmlCarregando(8);
    try {
      disputa = await obterDisputa(params.id);
    } catch {
      if (ativo) area.innerHTML = htmlErro();
      return;
    }
    if (!ativo) return;

    if (!disputa) {
      area.innerHTML = `
        <div class="estado">
          <div class="estado__icone" aria-hidden="true">🔍</div>
          <p class="estado__titulo">Disputa não encontrada</p>
          <p class="estado__texto">Não existe nenhuma disputa com o número ${esc(params.id)}.</p>
          <a class="btn" href="#/disputas">Voltar para a lista</a>
        </div>`;
      return;
    }
    desenhar();
  }

  /** Aprovar ou negar: pede justificativa e confirmação antes de enviar. */
  async function decidir(aprovar) {
    const resposta = await confirmarAcao({
      titulo: aprovar ? 'Aprovar esta disputa?' : 'Negar esta disputa?',
      texto: 'A decisão fica registrada junto com a sua justificativa.',
      rotuloConfirmar: aprovar ? 'Aprovar' : 'Negar',
      variante: aprovar ? 'positivo' : 'perigo',
      justificativa: { rotulo: 'Justificativa' },
    });
    if (!resposta) return;

    area.querySelectorAll('[data-acao]').forEach((b) => (b.disabled = true));
    try {
      await decidirDisputa(disputa.id, { aprovar, justificativa: resposta.justificativa });
      mostrarAviso({
        titulo: 'Ação concluída',
        texto: aprovar ? 'A disputa foi aprovada.' : 'A disputa foi negada.',
      });
    } catch {
      mostrarAviso({ tipo: 'erro', titulo: 'Não foi possível concluir', texto: 'Tente de novo em instantes.' });
    }
    desenhar();
  }

  /** Reembolso total ou parcial: valida o valor e pede confirmação. */
  async function reembolsar(formulario) {
    const tipo = formulario.elements.tipo.value;
    const campoValor = formulario.elements.valor;
    const valor = Number(campoValor.value);
    const erro = formulario.querySelector('#erro-valor');

    let mensagem = '';
    if (!campoValor.value || Number.isNaN(valor) || valor <= 0) mensagem = 'Informe um valor maior que zero.';
    else if (valor > disputa.valorPedido)
      mensagem = `O valor não pode passar de ${formatarMoeda(disputa.valorPedido)}.`;
    erro.textContent = mensagem;
    if (mensagem) {
      campoValor.setAttribute('aria-invalid', 'true');
      campoValor.focus();
      return;
    }
    campoValor.removeAttribute('aria-invalid');

    const resposta = await confirmarAcao({
      titulo: `Reembolsar ${formatarMoeda(valor)}?`,
      texto: `Reembolso ${tipo.toLowerCase()} da disputa ${disputa.id}.`,
      rotuloConfirmar: 'Reembolsar',
      variante: 'positivo',
    });
    if (!resposta) return;

    formulario.querySelector('button[type="submit"]').disabled = true;
    try {
      await registrarReembolso(disputa.id, { tipo, valor });
      mostrarAviso({ titulo: 'Ação concluída', texto: 'O reembolso foi registrado.' });
    } catch {
      mostrarAviso({ tipo: 'erro', titulo: 'Não foi possível concluir', texto: 'Tente de novo em instantes.' });
    }
    desenhar();
  }

  area.addEventListener('click', (evento) => {
    const acao = evento.target.closest('[data-acao]')?.dataset.acao;
    if (acao === 'tentar-novo') carregar();
    if (acao === 'aprovar') decidir(true);
    if (acao === 'negar') decidir(false);
  });

  // Total preenche o valor do pedido; Parcial deixa a pessoa digitar.
  area.addEventListener('change', (evento) => {
    if (evento.target.name !== 'tipo') return;
    const campoValor = evento.target.form.elements.valor;
    const total = evento.target.value === 'Total';
    campoValor.readOnly = total;
    campoValor.value = total ? disputa.valorPedido.toFixed(2) : '';
    campoValor.removeAttribute('aria-invalid');
    evento.target.form.querySelector('#erro-valor').textContent = '';
    if (!total) campoValor.focus();
  });

  area.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (evento.target.matches('[data-form-reembolso]')) reembolsar(evento.target);
  });

  carregar();
  return () => {
    ativo = false;
  };
}
