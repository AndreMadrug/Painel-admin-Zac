// Tela — Detalhe do vendedor: loja, documento mascarado, aprovar/reprovar/suspender.
import { selo } from '../../components/selo.js';
import { htmlCarregando, htmlErro } from '../../components/estados.js';
import { confirmarAcao } from '../../components/confirmacao.js';
import { mostrarAviso } from '../../components/aviso.js';
import { obterVendedor, decidirVendedor, STATUS_VENDEDOR } from '../../modules/usuarios/dados.js';
import { formatarMoeda, formatarDataHora, esc } from '../../lib/format.js';

const ACOES = {
  aprovar: {
    status: 'verificado', titulo: 'Aprovar este vendedor?', texto: 'A loja passa a poder vender na plataforma.',
    rotulo: 'Aprovar', variante: 'positivo', motivo: false, aviso: 'O vendedor foi aprovado.',
  },
  reprovar: {
    status: 'reprovado', titulo: 'Reprovar este vendedor?', texto: 'O cadastro da loja será recusado.',
    rotulo: 'Reprovar', variante: 'perigo', motivo: true, aviso: 'O vendedor foi reprovado.',
  },
  suspender: {
    status: 'suspenso', titulo: 'Suspender este vendedor?', texto: 'A loja deixa de vender até ser reativada.',
    rotulo: 'Suspender', variante: 'perigo', motivo: true, aviso: 'O vendedor foi suspenso.',
  },
  reativar: {
    status: 'verificado', titulo: 'Reativar este vendedor?', texto: 'A loja volta a vender na plataforma.',
    rotulo: 'Reativar', variante: 'positivo', motivo: false, aviso: 'O vendedor foi reativado.',
  },
};

const BOTOES = {
  em_verificacao: [['aprovar', 'Aprovar', 'positivo'], ['reprovar', 'Reprovar', 'perigo']],
  verificado: [['suspender', 'Suspender', 'perigo']],
  suspenso: [['reativar', 'Reativar', 'positivo']],
  reprovado: [],
};

function htmlDecisao(v) {
  const motivo = v.decisao
    ? `<dl class="dados">
        <dt>Motivo</dt><dd>${esc(v.decisao.motivo)}</dd>
        <dt>Data</dt><dd>${esc(formatarDataHora(v.decisao.em))}</dd>
      </dl>`
    : '';
  const botoes = BOTOES[v.status]
    .map(([acao, rotulo, variante]) => `<button class="btn btn--${variante}" type="button" data-acao="${acao}">${rotulo}</button>`)
    .join('');
  const rodape = botoes
    ? `<p class="nota" style="margin:${motivo ? '14px' : '0'} 0 14px">Reprovar e suspender exigem um motivo.</p><div class="acoes">${botoes}</div>`
    : `<p class="nota" style="margin-top:${motivo ? '14px' : '0'}">Cadastro reprovado: não há ações disponíveis.</p>`;
  return motivo + rodape;
}

export function paginaVendedorDetalhe({ container, params }) {
  container.innerHTML = `
    <a class="voltar" href="#/usuarios-e-vendedores">← Voltar para Usuários e vendedores</a>
    <div data-conteudo class="pagina" style="padding:0"></div>`;
  const area = container.querySelector('[data-conteudo]');
  let vendedor = null;
  let ativo = true;

  function desenhar() {
    const status = STATUS_VENDEDOR[vendedor.status];
    area.innerHTML = `
      <div class="pagina__topo">
        <div>
          <h1>${esc(vendedor.loja)}</h1>
          <p class="pagina__subtitulo">${esc(vendedor.id)} · Cadastro enviado em ${esc(formatarDataHora(vendedor.enviadoEm))}</p>
        </div>
        ${selo(status.rotulo, status.variante)}
      </div>

      <div class="detalhe-grade">
        <section class="cartao" aria-labelledby="titulo-loja">
          <h2 id="titulo-loja">Loja</h2>
          <p class="nota" style="margin-bottom:14px">${esc(vendedor.descricao)}</p>
          <dl class="dados">
            <dt>Categoria</dt><dd>${esc(vendedor.categoria)}</dd>
            <dt>Produtos</dt><dd>${vendedor.produtos}</dd>
            <dt>Vendas até agora</dt><dd>${formatarMoeda(vendedor.vendas)}</dd>
          </dl>
        </section>

        <section class="cartao" aria-labelledby="titulo-resp">
          <h2 id="titulo-resp">Responsável</h2>
          <dl class="dados">
            <dt>Nome</dt><dd>${esc(vendedor.responsavel)}</dd>
            <dt>Documento</dt><dd>${esc(vendedor.documento)}</dd>
          </dl>
          <p class="nota" style="margin-top:10px">O documento aparece mascarado.</p>
        </section>
      </div>

      <section class="cartao" aria-labelledby="titulo-verificacao">
        <h2 id="titulo-verificacao">Verificação</h2>
        ${htmlDecisao(vendedor)}
      </section>`;
  }

  async function carregar() {
    area.innerHTML = htmlCarregando(8);
    try {
      vendedor = await obterVendedor(params.id);
    } catch {
      if (ativo) area.innerHTML = htmlErro();
      return;
    }
    if (!ativo) return;

    if (!vendedor) {
      area.innerHTML = `
        <div class="estado">
          <div class="estado__icone" aria-hidden="true">🔍</div>
          <p class="estado__titulo">Vendedor não encontrado</p>
          <p class="estado__texto">Não existe nenhum vendedor com o código ${esc(params.id)}.</p>
          <a class="btn" href="#/usuarios-e-vendedores">Voltar para a lista</a>
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
      await decidirVendedor(vendedor.id, { status: acao.status, motivo: resposta.justificativa });
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