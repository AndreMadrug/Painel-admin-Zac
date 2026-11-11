// Tela — Detalhe do produto: fotos, preço, estoque, aprovar, ocultar ou remover (com motivo).
import { selo } from '../../components/selo.js';
import { htmlCarregando, htmlErro } from '../../components/estados.js';
import { confirmarAcao } from '../../components/confirmacao.js';
import { mostrarAviso } from '../../components/aviso.js';
import { obterProduto, alterarStatusProduto, STATUS_PRODUTO } from '../../modules/produtos/dados.js';
import { formatarMoeda, formatarDataHora, esc } from '../../lib/format.js';

const ACOES = {
  aprovar: {
    status: 'aprovado', titulo: 'Aprovar este produto?', texto: 'O anúncio fica visível na plataforma.',
    rotulo: 'Aprovar', variante: 'positivo', motivo: false, aviso: 'O produto foi aprovado.',
  },
  ocultar: {
    status: 'oculto', titulo: 'Ocultar este produto?', texto: 'O anúncio deixa de aparecer, mas pode voltar depois.',
    rotulo: 'Ocultar', variante: 'perigo', motivo: true, aviso: 'O produto foi ocultado.',
  },
  remover: {
    status: 'removido', titulo: 'Remover este produto?', texto: 'O anúncio sai da plataforma.',
    rotulo: 'Remover', variante: 'perigo', motivo: true, aviso: 'O produto foi removido.',
  },
};

const BOTOES = {
  em_analise: [['aprovar', 'Aprovar', 'positivo'], ['ocultar', 'Ocultar', 'perigo'], ['remover', 'Remover', 'perigo']],
  aprovado: [['ocultar', 'Ocultar', 'perigo'], ['remover', 'Remover', 'perigo']],
  oculto: [['aprovar', 'Aprovar', 'positivo'], ['remover', 'Remover', 'perigo']],
  removido: [],
};

function htmlFotos(fotos) {
  if (!fotos.length) return '<p class="nota">Nenhuma foto foi enviada.</p>';
  return `<ul class="lista-evidencias">${fotos
    .map(
      (f) => `<li class="evidencia">
        <span class="evidencia__icone" aria-hidden="true">🖼️</span>
        <span>${esc(f.nome)}<small class="nota" style="display:block">Foto de exemplo</small></span>
      </li>`
    )
    .join('')}</ul>`;
}

function htmlDecisao(produto) {
  const registro = produto.decisao
    ? `<dl class="dados">
        <dt>Motivo</dt><dd>${esc(produto.decisao.motivo)}</dd>
        <dt>Data</dt><dd>${esc(formatarDataHora(produto.decisao.em))}</dd>
      </dl>`
    : '';
  const botoes = BOTOES[produto.status]
    .map(([acao, rotulo, variante]) => `<button class="btn btn--${variante}" type="button" data-acao="${acao}">${rotulo}</button>`)
    .join('');
  const margem = registro ? '14px' : '0';
  const rodape = botoes
    ? `<p class="nota" style="margin:${margem} 0 14px">Ocultar e remover exigem um motivo.</p><div class="acoes">${botoes}</div>`
    : `<p class="nota" style="margin-top:${margem}">Produto removido: não há ações disponíveis.</p>`;
  return registro + rodape;
}

export function paginaProdutoDetalhe({ container, params }) {
  container.innerHTML = `
    <a class="voltar" href="#/produtos-e-denuncias">← Voltar para Produtos e denúncias</a>
    <div data-conteudo class="pagina" style="padding:0"></div>`;
  const area = container.querySelector('[data-conteudo]');
  let produto = null;
  let ativo = true;

  function desenhar() {
    const status = STATUS_PRODUTO[produto.status];
    area.innerHTML = `
      <div class="pagina__topo">
        <div>
          <h1>${esc(produto.nome)}</h1>
          <p class="pagina__subtitulo">${esc(produto.id)} · Enviado em ${esc(formatarDataHora(produto.enviadoEm))}</p>
        </div>
        ${selo(status.rotulo, status.variante)}
      </div>

      <div class="detalhe-grade">
        <section class="cartao" aria-labelledby="titulo-anuncio">
          <h2 id="titulo-anuncio">Anúncio</h2>
          <p class="nota" style="margin-bottom:14px">${esc(produto.descricao)}</p>
          <dl class="dados">
            <dt>Vendedor</dt><dd>${esc(produto.vendedor)}</dd>
            <dt>Categoria</dt><dd>${esc(produto.categoria)}</dd>
            <dt>Preço</dt><dd>${formatarMoeda(produto.preco)}</dd>
            <dt>Estoque</dt><dd>${produto.estoque} unidades</dd>
          </dl>
        </section>

        <section class="cartao" aria-labelledby="titulo-fotos">
          <h2 id="titulo-fotos">Fotos</h2>
          ${htmlFotos(produto.fotos)}
        </section>
      </div>

      <section class="cartao" aria-labelledby="titulo-decisao">
        <h2 id="titulo-decisao">Decisão</h2>
        ${htmlDecisao(produto)}
      </section>`;
  }

  async function carregar() {
    area.innerHTML = htmlCarregando(8);
    try {
      produto = await obterProduto(params.id);
    } catch {
      if (ativo) area.innerHTML = htmlErro();
      return;
    }
    if (!ativo) return;

    if (!produto) {
      area.innerHTML = `
        <div class="estado">
          <div class="estado__icone" aria-hidden="true">🔍</div>
          <p class="estado__titulo">Produto não encontrado</p>
          <p class="estado__texto">Não existe nenhum produto com o código ${esc(params.id)}.</p>
          <a class="btn" href="#/produtos-e-denuncias">Voltar para a lista</a>
        </div>`;
      return;
    }
    desenhar();
  }

  async function decidir(nome) {
    const acao = ACOES[nome];
    const resposta = await confirmarAcao({
      titulo: acao.titulo,
      texto: acao.texto,
      rotuloConfirmar: acao.rotulo,
      variante: acao.variante,
      ...(acao.motivo ? { justificativa: { rotulo: 'Motivo' } } : {}),
    });
    if (!resposta) return;

    area.querySelectorAll('[data-acao]').forEach((b) => (b.disabled = true));
    try {
      await alterarStatusProduto(produto.id, { status: acao.status, motivo: resposta.justificativa });
      mostrarAviso({ titulo: 'Ação concluída', texto: acao.aviso });
    } catch {
      mostrarAviso({ tipo: 'erro', titulo: 'Não foi possível concluir', texto: 'Tente de novo em instantes.' });
    }
    desenhar();
  }

  area.addEventListener('click', (evento) => {
    const acao = evento.target.closest('[data-acao]')?.dataset.acao;
    if (acao === 'tentar-novo') carregar();
    else if (ACOES[acao]) decidir(acao);
  });

  carregar();
  return () => {
    ativo = false;
  };
}