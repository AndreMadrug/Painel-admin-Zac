// Tela — Detalhe do usuário: dados, endereços, papéis, restringir/bloquear/reativar.
import { selo } from '../../components/selo.js';
import { htmlCarregando, htmlErro } from '../../components/estados.js';
import { confirmarAcao } from '../../components/confirmacao.js';
import { mostrarAviso } from '../../components/aviso.js';
import { obterUsuario, alterarStatusUsuario, alterarPapeis, PAPEIS, STATUS_USUARIO } from '../../modules/usuarios/dados.js';
import { formatarDataHora, esc } from '../../lib/format.js';

const ACOES = {
  restrito: {
    titulo: 'Restringir esta conta?', texto: 'O usuário continua com acesso, mas com limites.',
    rotulo: 'Restringir', variante: 'perigo', motivo: true, aviso: 'A conta foi restringida.',
  },
  bloqueado: {
    titulo: 'Bloquear esta conta?', texto: 'O usuário deixa de conseguir entrar na plataforma.',
    rotulo: 'Bloquear', variante: 'perigo', motivo: true, aviso: 'A conta foi bloqueada.',
  },
  ativo: {
    titulo: 'Reativar esta conta?', texto: 'O usuário volta a usar a plataforma normalmente.',
    rotulo: 'Reativar', variante: 'positivo', motivo: false, aviso: 'A conta foi reativada.',
  },
};

// Quais botões aparecem em cada situação da conta.
const BOTOES = {
  ativo: [['restrito', 'Restringir', 'perigo'], ['bloqueado', 'Bloquear', 'perigo']],
  restrito: [['bloqueado', 'Bloquear', 'perigo'], ['ativo', 'Reativar', 'positivo']],
  bloqueado: [['ativo', 'Reativar', 'positivo']],
};

function htmlSituacao(u) {
  const motivo = u.restricao
    ? `<dl class="dados">
        <dt>Motivo</dt><dd>${esc(u.restricao.motivo)}</dd>
        <dt>Desde</dt><dd>${esc(formatarDataHora(u.restricao.em))}</dd>
      </dl>`
    : '';
  const botoes = BOTOES[u.status]
    .map(([acao, rotulo, variante]) => `<button class="btn btn--${variante}" type="button" data-acao="${acao}">${rotulo}</button>`)
    .join('');
  return `${motivo}
    <p class="nota" style="margin:${u.restricao ? '14px' : '0'} 0 14px">Restringir e bloquear exigem um motivo.</p>
    <div class="acoes">${botoes}</div>`;
}

function htmlPapeis(u) {
  const opcoes = PAPEIS.map(
    (p) => `<label><input type="checkbox" name="papel" value="${esc(p)}"${u.papeis.includes(p) ? ' checked' : ''} /> ${esc(p)}</label>`
  ).join('');
  return `
    <form data-form-papeis novalidate>
      <fieldset style="border:0;padding:0;margin:0 0 10px">
        <legend class="sr-only">Papéis do usuário</legend>
        <div class="opcoes">${opcoes}</div>
      </fieldset>
      <span class="campo__erro" id="erro-papeis" role="alert"></span>
      <div style="margin-top:10px"><button class="btn" type="submit">Salvar papéis</button></div>
    </form>`;
}

export function paginaUsuarioDetalhe({ container, params }) {
  container.innerHTML = `
    <a class="voltar" href="#/usuarios-e-vendedores">← Voltar para Usuários e vendedores</a>
    <div data-conteudo class="pagina" style="padding:0"></div>`;
  const area = container.querySelector('[data-conteudo]');
  let usuario = null;
  let ativo = true;

  function desenhar() {
    const status = STATUS_USUARIO[usuario.status];
    const enderecos = usuario.enderecos.length
      ? usuario.enderecos
          .map((e) => `<dt>${esc(e.apelido)}</dt><dd>${esc(e.rua)} · ${esc(e.bairro)} · ${esc(e.cidade)}</dd>`)
          .join('')
      : '<dt>Endereços</dt><dd>Nenhum endereço cadastrado.</dd>';

    area.innerHTML = `
      <div class="pagina__topo">
        <div>
          <h1>${esc(usuario.nome)}</h1>
          <p class="pagina__subtitulo">${esc(usuario.id)} · Cadastro em ${esc(formatarDataHora(usuario.criadoEm))}</p>
        </div>
        ${selo(status.rotulo, status.variante)}
      </div>

      <div class="detalhe-grade">
        <section class="cartao" aria-labelledby="titulo-dados">
          <h2 id="titulo-dados">Dados</h2>
          <dl class="dados">
            <dt>Nome</dt><dd>${esc(usuario.nome)}</dd>
            <dt>E-mail</dt><dd>${esc(usuario.email)}</dd>
            <dt>Telefone</dt><dd>${esc(usuario.telefone)}</dd>
            <dt>Pedidos feitos</dt><dd>${usuario.pedidos}</dd>
          </dl>
        </section>

        <section class="cartao" aria-labelledby="titulo-enderecos">
          <h2 id="titulo-enderecos">Endereços</h2>
          <dl class="dados">${enderecos}</dl>
        </section>

        <section class="cartao" aria-labelledby="titulo-papeis">
          <h2 id="titulo-papeis">Papéis</h2>
          ${htmlPapeis(usuario)}
        </section>

        <section class="cartao" aria-labelledby="titulo-situacao">
          <h2 id="titulo-situacao">Situação da conta</h2>
          ${htmlSituacao(usuario)}
        </section>
      </div>`;
  }

  async function carregar() {
    area.innerHTML = htmlCarregando(8);
    try {
      usuario = await obterUsuario(params.id);
    } catch {
      if (ativo) area.innerHTML = htmlErro();
      return;
    }
    if (!ativo) return;

    if (!usuario) {
      area.innerHTML = `
        <div class="estado">
          <div class="estado__icone" aria-hidden="true">🔍</div>
          <p class="estado__titulo">Usuário não encontrado</p>
          <p class="estado__texto">Não existe nenhum usuário com o código ${esc(params.id)}.</p>
          <a class="btn" href="#/usuarios-e-vendedores">Voltar para a lista</a>
        </div>`;
      return;
    }
    desenhar();
  }

  async function mudarStatus(novoStatus) {
    const acao = ACOES[novoStatus];
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
      await alterarStatusUsuario(usuario.id, { status: novoStatus, motivo: resposta.justificativa });
      mostrarAviso({ titulo: 'Ação concluída', texto: acao.aviso });
    } catch {
      mostrarAviso({ tipo: 'erro', titulo: 'Não foi possível concluir', texto: 'Tente de novo em instantes.' });
    }
    desenhar();
  }

  async function salvarPapeis(formulario) {
    const escolhidos = [...formulario.querySelectorAll('input[name="papel"]:checked')].map((i) => i.value);
    const erro = formulario.querySelector('#erro-papeis');
    erro.textContent = escolhidos.length ? '' : 'Escolha pelo menos um papel.';
    if (!escolhidos.length) return;

    const resposta = await confirmarAcao({
      titulo: 'Alterar os papéis deste usuário?',
      texto: `Novos papéis: ${escolhidos.join(', ')}.`,
      rotuloConfirmar: 'Salvar',
      variante: 'positivo',
    });
    if (!resposta) return;

    formulario.querySelector('button[type="submit"]').disabled = true;
    try {
      await alterarPapeis(usuario.id, escolhidos);
      mostrarAviso({ titulo: 'Ação concluída', texto: 'Os papéis foram atualizados.' });
    } catch {
      mostrarAviso({ tipo: 'erro', titulo: 'Não foi possível concluir', texto: 'Tente de novo em instantes.' });
    }
    desenhar();
  }

  area.addEventListener('click', (evento) => {
    const acao = evento.target.closest('[data-acao]')?.dataset.acao;
    if (acao === 'tentar-novo') carregar();
    else if (ACOES[acao]) mudarStatus(acao);
  });

  area.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (evento.target.matches('[data-form-papeis]')) salvarPapeis(evento.target);
  });

  carregar();
  return () => {
    ativo = false;
  };
}