// Tela 19 — Novo chamado: usuário, assunto, prioridade e mensagem inicial (RF-ISU-06).
import { htmlCarregando, htmlErro } from '../../components/estados.js';
import { mostrarAviso } from '../../components/aviso.js';
import { sessaoAtual } from '../../lib/sessao.js';
import { listarUsuarios } from '../../modules/usuarios/dados.js';
import { criarChamado, PRIORIDADES } from '../../modules/suporte/dados.js';
import { esc } from '../../lib/format.js';

export function paginaChamadoNovo({ container }) {
  container.innerHTML = `
    <a class="voltar" href="#/impacto-e-suporte">← Voltar para Impacto e suporte</a>
    <div data-conteudo class="pagina" style="padding:0"></div>`;
  const area = container.querySelector('[data-conteudo]');
  let usuarios = [];
  let ativo = true;

  const REGRAS = {
    usuario: 'Escolha o usuário.',
    assunto: 'Escreva o assunto do chamado.',
    prioridade: 'Escolha a prioridade.',
    mensagem: 'Escreva a mensagem inicial.',
  };

  function desenhar() {
    area.innerHTML = `
      <div class="pagina__topo"><div><h1>Novo chamado</h1>
        <p class="pagina__subtitulo">Registre um atendimento em nome de um usuário.</p></div></div>
      <form class="cartao formulario" novalidate data-formulario>
        <label class="campo" for="nc-usuario"><span>Usuário</span>
          <select id="nc-usuario" name="usuario" aria-describedby="nc-usuario-erro">
            <option value="">Escolha um usuário…</option>
            ${usuarios.map((u) => `<option value="${esc(u.id)}">${esc(u.nome)} (${esc(u.id)})</option>`).join('')}
          </select><span class="campo__erro" id="nc-usuario-erro" role="alert"></span></label>
        <label class="campo" for="nc-assunto"><span>Assunto</span>
          <input id="nc-assunto" name="assunto" type="text" maxlength="80" aria-describedby="nc-assunto-erro" />
          <span class="campo__erro" id="nc-assunto-erro" role="alert"></span></label>
        <label class="campo" for="nc-prioridade"><span>Prioridade</span>
          <select id="nc-prioridade" name="prioridade" aria-describedby="nc-prioridade-erro">
            <option value="">Escolha a prioridade…</option>
            ${Object.entries(PRIORIDADES).map(([v, p]) => `<option value="${v}">${esc(p.rotulo)}</option>`).join('')}
          </select><span class="campo__erro" id="nc-prioridade-erro" role="alert"></span></label>
        <label class="campo" for="nc-mensagem"><span>Mensagem inicial</span>
          <textarea id="nc-mensagem" name="mensagem" rows="5" maxlength="1000" aria-describedby="nc-mensagem-erro"></textarea>
          <span class="campo__erro" id="nc-mensagem-erro" role="alert"></span></label>
        <div class="acoes">
          <button class="btn" type="submit">Abrir chamado</button>
          <a class="btn btn--neutro" href="#/impacto-e-suporte">Cancelar</a>
        </div>
      </form>`;
  }

  async function carregar() {
    area.innerHTML = htmlCarregando(6);
    try {
      usuarios = await listarUsuarios();
    } catch {
      if (ativo) area.innerHTML = htmlErro();
      return;
    }
    if (ativo) desenhar();
  }

  function validar(formulario, nome) {
    const campo = formulario.elements[nome];
    const vazio = !campo.value.trim();
    if (vazio) campo.setAttribute('aria-invalid', 'true');
    else campo.removeAttribute('aria-invalid');
    formulario.querySelector(`#nc-${nome}-erro`).textContent = vazio ? REGRAS[nome] : '';
    return !vazio;
  }

  area.addEventListener('focusout', (evento) => {
    const nome = evento.target.name;
    if (nome in REGRAS) validar(area.querySelector('form'), nome);
  });

  area.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const formulario = evento.target;
    const invalidos = Object.keys(REGRAS).filter((n) => !validar(formulario, n));
    if (invalidos.length) {
      formulario.elements[invalidos[0]].focus();
      return;
    }
    const dono = usuarios.find((u) => u.id === formulario.elements.usuario.value);
    formulario.querySelectorAll('button').forEach((b) => (b.disabled = true));
    try {
      const chamado = await criarChamado({
        usuario: { id: dono.id, nome: dono.nome },
        assunto: formulario.elements.assunto.value.trim(),
        prioridade: formulario.elements.prioridade.value,
        mensagem: formulario.elements.mensagem.value.trim(),
        autor: sessaoAtual()?.nome ?? 'Equipe zac',
      });
      mostrarAviso({ titulo: 'Chamado aberto', texto: `O chamado ${chamado.id} foi registrado.` });
      if (ativo) location.hash = `#/impacto-e-suporte/chamados/${chamado.id}`;
    } catch {
      mostrarAviso({ tipo: 'erro', titulo: 'Não foi possível abrir o chamado', texto: 'Seus dados continuam na tela. Tente de novo.' });
      formulario.querySelectorAll('button').forEach((b) => (b.disabled = false));
    }
  });

  area.addEventListener('click', (evento) => {
    if (evento.target.closest('[data-acao="tentar-novo"]')) carregar();
  });

  carregar();
  return () => {
    ativo = false;
  };
}
