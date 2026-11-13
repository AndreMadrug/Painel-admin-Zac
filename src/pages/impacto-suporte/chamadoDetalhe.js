// Tela 20 — Detalhe do chamado: conversa, resposta, mudança de status e encerramento (RF-ISU-05).
import { selo } from '../../components/selo.js';
import { htmlCarregando, htmlErro } from '../../components/estados.js';
import { confirmarAcao } from '../../components/confirmacao.js';
import { mostrarAviso } from '../../components/aviso.js';
import { sessaoAtual } from '../../lib/sessao.js';
import {
  obterChamado, responderChamado, mudarStatusChamado, encerrarChamado,
  PRIORIDADES, STATUS_CHAMADO, STATUS_ESCOLHIVEIS,
} from '../../modules/suporte/dados.js';
import { formatarDataHora, esc } from '../../lib/format.js';

export function paginaChamadoDetalhe({ container, params }) {
  container.innerHTML = `
    <a class="voltar" href="#/impacto-e-suporte">← Voltar para Impacto e suporte</a>
    <div data-conteudo class="pagina" style="padding:0"></div>`;
  const area = container.querySelector('[data-conteudo]');
  let chamado = null;
  let rascunho = '';
  let ativo = true;
  const autor = () => sessaoAtual()?.nome ?? 'Equipe zac';

  function htmlConversa() {
    return `<ol class="conversa" aria-label="Conversa do chamado">${chamado.mensagens
      .map(
        (m) => `<li class="balao balao--${m.autor}">
          <div class="balao__topo"><strong>${esc(m.nome)}</strong>
            <span>${m.autor === 'equipe' ? 'Equipe' : 'Usuário'} · ${esc(formatarDataHora(m.em))}</span></div>
          <p>${esc(m.texto)}</p></li>`
      )
      .join('')}</ol>`;
  }

  function htmlResposta() {
    if (chamado.status === 'encerrado') {
      return '<p class="nota">Este chamado está encerrado e não aceita novas respostas.</p>';
    }
    const opcoes = STATUS_ESCOLHIVEIS.map(
      (s) => `<option value="${s}"${s === chamado.status ? ' selected' : ''}>${esc(STATUS_CHAMADO[s].rotulo)}</option>`
    ).join('');
    return `
      <form class="formulario" novalidate data-resposta>
        <label class="campo" for="resposta-texto"><span>Sua resposta</span>
          <textarea id="resposta-texto" name="texto" rows="4" maxlength="1000" aria-describedby="resposta-erro">${esc(rascunho)}</textarea>
          <span class="campo__erro" id="resposta-erro" role="alert"></span></label>
        <div class="acoes"><button class="btn" type="submit">Enviar resposta</button></div>
      </form>
      <hr class="divisor" />
      <div class="acoes" style="align-items:end">
        <label class="campo" for="novo-status" style="min-width:220px"><span>Status do chamado</span>
          <select id="novo-status" data-status>${opcoes}</select></label>
        <button class="btn btn--neutro" type="button" data-acao="salvar-status">Atualizar status</button>
        <button class="btn btn--perigo" type="button" data-acao="encerrar">Encerrar chamado</button>
      </div>`;
  }

  function desenhar() {
    const status = STATUS_CHAMADO[chamado.status];
    const prioridade = PRIORIDADES[chamado.prioridade];
    area.innerHTML = `
      <div class="pagina__topo">
        <div><h1>${esc(chamado.assunto)}</h1>
          <p class="pagina__subtitulo">${esc(chamado.id)} · ${esc(chamado.usuario.nome)} (${esc(chamado.usuario.id)}) · aberto em ${esc(formatarDataHora(chamado.criadoEm))}</p></div>
        <div class="acoes">${selo(prioridade.rotulo, prioridade.variante)}${selo(status.rotulo, status.variante)}</div>
      </div>
      <section class="cartao" aria-labelledby="titulo-conversa"><h2 id="titulo-conversa">Conversa</h2>${htmlConversa()}</section>
      <section class="cartao" aria-labelledby="titulo-atendimento"><h2 id="titulo-atendimento">Atendimento</h2>${htmlResposta()}</section>`;
  }

  async function carregar() {
    area.innerHTML = htmlCarregando(8);
    try {
      chamado = await obterChamado(params.id);
    } catch {
      if (ativo) area.innerHTML = htmlErro();
      return;
    }
    if (!ativo) return;
    if (!chamado) {
      area.innerHTML = `
        <div class="estado"><div class="estado__icone" aria-hidden="true">🔍</div>
          <p class="estado__titulo">Chamado não encontrado</p>
          <p class="estado__texto">Não existe nenhum chamado com o código ${esc(params.id)}.</p>
          <a class="btn" href="#/impacto-e-suporte">Voltar para a lista</a></div>`;
      return;
    }
    desenhar();
  }

  async function executar(promessa, titulo, texto) {
    area.querySelectorAll('button').forEach((b) => (b.disabled = true));
    try {
      await promessa();
      mostrarAviso({ titulo, texto });
      return true;
    } catch {
      mostrarAviso({ tipo: 'erro', titulo: 'Não foi possível concluir', texto: 'Tente de novo em instantes.' });
      return false;
    } finally {
      if (ativo) desenhar();
    }
  }

  area.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const campo = evento.target.elements.texto;
    rascunho = campo.value;
    if (!campo.value.trim()) {
      campo.setAttribute('aria-invalid', 'true');
      area.querySelector('#resposta-erro').textContent = 'Escreva a resposta antes de enviar.';
      campo.focus();
      return;
    }
    const texto = campo.value.trim();
    const ok = await executar(() => responderChamado(chamado.id, { texto, autor: autor() }), 'Resposta enviada', 'A mensagem entrou na conversa.');
    if (ok) rascunho = '';
    if (ativo) desenhar();
  });

  area.addEventListener('input', (evento) => {
    if (evento.target.name === 'texto') {
      rascunho = evento.target.value;
      evento.target.removeAttribute('aria-invalid');
      area.querySelector('#resposta-erro').textContent = '';
    }
  });

  area.addEventListener('click', async (evento) => {
    const acao = evento.target.closest('[data-acao]')?.dataset.acao;
    if (acao === 'tentar-novo') carregar();
    else if (acao === 'salvar-status') {
      const novo = area.querySelector('[data-status]').value;
      if (novo === chamado.status) {
        mostrarAviso({ titulo: 'Nada para atualizar', texto: 'Escolha um status diferente.' });
        return;
      }
      await executar(() => mudarStatusChamado(chamado.id, novo), 'Status atualizado', `Agora: ${STATUS_CHAMADO[novo].rotulo}.`);
    } else if (acao === 'encerrar') {
      const resposta = await confirmarAcao({
        titulo: 'Encerrar este chamado?',
        texto: 'Depois de encerrado, não é possível responder.',
        rotuloConfirmar: 'Encerrar chamado',
        variante: 'perigo',
      });
      if (!resposta || !ativo) return;
      await executar(() => encerrarChamado(chamado.id, { autor: autor() }), 'Chamado encerrado', 'O atendimento foi finalizado.');
    }
  });

  carregar();
  return () => {
    ativo = false;
  };
}
