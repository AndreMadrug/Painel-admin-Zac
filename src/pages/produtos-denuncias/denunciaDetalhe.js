// Tela — Detalhe da denúncia: motivo, conteúdo denunciado, manter ou remover e encerrar o caso.
import { selo } from '../../components/selo.js';
import { htmlCarregando, htmlErro } from '../../components/estados.js';
import { confirmarAcao } from '../../components/confirmacao.js';
import { mostrarAviso } from '../../components/aviso.js';
import { obterDenuncia, decidirDenuncia, encerrarDenuncia, STATUS_DENUNCIA } from '../../modules/produtos/dados.js';
import { formatarDataHora, esc } from '../../lib/format.js';

function htmlDecisao(d) {
  if (d.status === 'aberta') {
    return `
      <p class="nota" style="margin-bottom:14px">Decida o que fazer com o conteúdo. O motivo é obrigatório.</p>
      <div class="acoes">
        <button class="btn btn--positivo" type="button" data-acao="manter">Manter conteúdo</button>
        <button class="btn btn--perigo" type="button" data-acao="remover">Remover conteúdo</button>
      </div>`;
  }

  const registro = `
    <dl class="dados">
      <dt>Decisão</dt><dd>${d.decisao.tipo === 'mantida' ? 'Conteúdo mantido' : 'Conteúdo removido'}</dd>
      <dt>Motivo</dt><dd>${esc(d.decisao.motivo)}</dd>
      <dt>Data</dt><dd>${esc(formatarDataHora(d.decisao.em))}</dd>
    </dl>`;

  if (d.status === 'encerrada') return `${registro}<p class="nota" style="margin-top:14px">Caso encerrado.</p>`;
  return `${registro}
    <div class="acoes" style="margin-top:14px">
      <button class="btn" type="button" data-acao="encerrar">Encerrar o caso</button>
    </div>`;
}

export function paginaDenunciaDetalhe({ container, params }) {
  container.innerHTML = `
    <a class="voltar" href="#/produtos-e-denuncias">← Voltar para Produtos e denúncias</a>
    <div data-conteudo class="pagina" style="padding:0"></div>`;
  const area = container.querySelector('[data-conteudo]');
  let denuncia = null;
  let ativo = true;

  function desenhar() {
    const status = STATUS_DENUNCIA[denuncia.status];
    const atalho =
      denuncia.alvoTipo === 'Produto'
        ? `<div class="acoes" style="margin-top:14px"><a class="btn" href="#/produtos-e-denuncias/produtos/${esc(denuncia.alvoId)}">Ver produto (${esc(denuncia.alvoId)})</a></div>`
        : '';

    area.innerHTML = `
      <div class="pagina__topo">
        <div>
          <h1>Denúncia ${esc(denuncia.id)}</h1>
          <p class="pagina__subtitulo">Aberta em ${esc(formatarDataHora(denuncia.abertaEm))} · ${esc(denuncia.alvoTipo)}</p>
        </div>
        ${selo(status.rotulo, status.variante)}
      </div>

      <div class="detalhe-grade">
        <section class="cartao" aria-labelledby="titulo-motivo">
          <h2 id="titulo-motivo">Motivo</h2>
          <p><strong>${esc(denuncia.motivo)}</strong></p>
          <p class="nota" style="margin:6px 0 14px">${esc(denuncia.descricao)}</p>
          <dl class="dados"><dt>Denunciante</dt><dd>${esc(denuncia.denunciante)}</dd></dl>
        </section>

        <section class="cartao" aria-labelledby="titulo-conteudo">
          <h2 id="titulo-conteudo">Conteúdo denunciado</h2>
          <p><strong>${esc(denuncia.alvoNome)}</strong></p>
          <p class="nota" style="margin-top:6px">${esc(denuncia.conteudo)}</p>
          ${atalho}
        </section>
      </div>

      <section class="cartao" aria-labelledby="titulo-decisao">
        <h2 id="titulo-decisao">Decisão</h2>
        ${htmlDecisao(denuncia)}
      </section>`;
  }

  async function carregar() {
    area.innerHTML = htmlCarregando(8);
    try {
      denuncia = await obterDenuncia(params.id);
    } catch {
      if (ativo) area.innerHTML = htmlErro();
      return;
    }
    if (!ativo) return;

    if (!denuncia) {
      area.innerHTML = `
        <div class="estado">
          <div class="estado__icone" aria-hidden="true">🔍</div>
          <p class="estado__titulo">Denúncia não encontrada</p>
          <p class="estado__texto">Não existe nenhuma denúncia com o número ${esc(params.id)}.</p>
          <a class="btn" href="#/produtos-e-denuncias">Voltar para a lista</a>
        </div>`;
      return;
    }
    desenhar();
  }

  async function executar(promessa, textoAviso) {
    area.querySelectorAll('[data-acao]').forEach((b) => (b.disabled = true));
    try {
      await promessa();
      mostrarAviso({ titulo: 'Ação concluída', texto: textoAviso });
    } catch {
      mostrarAviso({ tipo: 'erro', titulo: 'Não foi possível concluir', texto: 'Tente de novo em instantes.' });
    }
    desenhar();
  }

  async function decidir(remover) {
    const resposta = await confirmarAcao({
      titulo: remover ? 'Remover este conteúdo?' : 'Manter este conteúdo?',
      texto: remover ? 'O conteúdo denunciado sai da plataforma.' : 'O conteúdo continua visível.',
      rotuloConfirmar: remover ? 'Remover' : 'Manter',
      variante: remover ? 'perigo' : 'positivo',
      justificativa: { rotulo: 'Motivo' },
    });
    if (!resposta) return;
    await executar(
      () => decidirDenuncia(denuncia.id, { remover, motivo: resposta.justificativa }),
      remover ? 'O conteúdo foi removido.' : 'O conteúdo foi mantido.'
    );
  }

  async function encerrar() {
    const resposta = await confirmarAcao({
      titulo: 'Encerrar este caso?',
      texto: 'A denúncia sai da fila de pendências.',
      rotuloConfirmar: 'Encerrar',
      variante: 'positivo',
    });
    if (!resposta) return;
    await executar(() => encerrarDenuncia(denuncia.id), 'O caso foi encerrado.');
  }

  area.addEventListener('click', (evento) => {
    const acao = evento.target.closest('[data-acao]')?.dataset.acao;
    if (acao === 'tentar-novo') carregar();
    if (acao === 'manter') decidir(false);
    if (acao === 'remover') decidir(true);
    if (acao === 'encerrar') encerrar();
  });

  carregar();
  return () => {
    ativo = false;
  };
}