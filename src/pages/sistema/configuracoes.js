// Tela 21 (parte 1) — Configurações: lista de chave e valor com confirmação ao salvar (RF-SIS-01).
import { htmlCarregando, htmlErro } from '../../components/estados.js';
import { confirmarAcao } from '../../components/confirmacao.js';
import { mostrarAviso } from '../../components/aviso.js';
import { sessaoAtual } from '../../lib/sessao.js';
import { listarConfiguracoes, salvarConfiguracoes } from '../../modules/sistema/dados.js';
import { esc } from '../../lib/format.js';

/** Devolve o texto do erro (ou '' quando está tudo certo). */
function erroDe(c, valor) {
  const texto = valor.trim();
  if (c.tipo === 'numero') {
    if (!texto) return 'Preencha este campo.';
    const n = Number(texto.replace(',', '.'));
    if (Number.isNaN(n)) return 'Digite apenas números.';
    if (n < c.min || n > c.max) return `Use um valor entre ${c.min} e ${c.max} ${c.unidade}.`;
  }
  if (c.tipo === 'email') {
    if (!texto) return 'Preencha este campo.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto)) return 'Digite um e-mail válido, como nome@site.com.br.';
  }
  if (c.tipo === 'texto' && texto.length > c.max) return `Use no máximo ${c.max} caracteres.`;
  return '';
}

/** Monta o conteúdo da aba "Configurações". Devolve a função de limpeza. */
export function abaConfiguracoes(painel) {
  let configs = [];
  let ativo = true;

  function htmlCampo(c) {
    const id = `cfg-${c.chave}`;
    const comum = `id="${id}" name="${c.chave}" aria-describedby="${id}-dica ${id}-erro"`;
    let controle;
    if (c.tipo === 'opcao') {
      controle = `<select ${comum}>${c.opcoes
        .map((o) => `<option${o === c.valor ? ' selected' : ''}>${esc(o)}</option>`)
        .join('')}</select>`;
    } else {
      controle = `<input ${comum} type="${c.tipo === 'numero' ? 'number' : c.tipo === 'email' ? 'email' : 'text'}" value="${esc(c.valor)}"${
        c.tipo === 'numero' ? ` min="${c.min}" max="${c.max}" step="any"` : ''
      }${c.tipo === 'texto' ? ` maxlength="${c.max}"` : ''} />`;
    }
    return `<div class="config">
      <div class="config__texto"><label for="${id}"><strong>${esc(c.rotulo)}</strong></label>
        <span class="campo__dica" id="${id}-dica">${esc(c.descricao)} <code>${esc(c.chave)}</code></span></div>
      <div class="config__valor campo">
        <div class="config__entrada">${controle}${c.unidade ? `<span>${esc(c.unidade)}</span>` : ''}</div>
        <span class="campo__erro" id="${id}-erro" role="alert"></span>
      </div></div>`;
  }

  function desenhar() {
    painel.innerHTML = `
      <form class="cartao" novalidate data-formulario>
        <h2>Configurações da plataforma</h2>
        <p class="nota" style="margin-bottom:8px">Ao salvar, você confirma as mudanças. Cada alteração fica registrada na auditoria.</p>
        ${configs.map(htmlCampo).join('')}
        <div class="acoes" style="margin-top:16px">
          <button class="btn" type="submit">Salvar alterações</button>
          <button class="btn btn--neutro" type="button" data-acao="descartar">Descartar alterações</button>
        </div>
      </form>`;
  }

  async function carregar() {
    painel.innerHTML = htmlCarregando(8);
    try {
      configs = await listarConfiguracoes();
    } catch {
      if (ativo) painel.innerHTML = htmlErro();
      return;
    }
    if (ativo) desenhar();
  }

  function validar(formulario, c) {
    const campo = formulario.elements[c.chave];
    const mensagem = erroDe(c, campo.value);
    if (mensagem) campo.setAttribute('aria-invalid', 'true');
    else campo.removeAttribute('aria-invalid');
    formulario.querySelector(`#cfg-${c.chave}-erro`).textContent = mensagem;
    return !mensagem;
  }

  painel.addEventListener('focusout', (evento) => {
    const c = configs.find((x) => x.chave === evento.target.name);
    if (c && c.tipo !== 'opcao') validar(painel.querySelector('form'), c);
  });

  painel.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const formulario = evento.target;
    const invalidas = configs.filter((c) => !validar(formulario, c));
    if (invalidas.length) {
      formulario.elements[invalidas[0].chave].focus();
      return;
    }
    const mudancas = {};
    configs.forEach((c) => {
      const novo = formulario.elements[c.chave].value.trim();
      if (novo !== c.valor) mudancas[c.chave] = novo;
    });
    const chaves = Object.keys(mudancas);
    if (!chaves.length) {
      mostrarAviso({ titulo: 'Nada para salvar', texto: 'Você ainda não mudou nenhuma configuração.' });
      return;
    }
    const resumo = chaves
      .map((k) => {
        const c = configs.find((x) => x.chave === k);
        return `${c.rotulo}: "${c.valor || 'vazio'}" → "${mudancas[k] || 'vazio'}"`;
      })
      .join(' · ');
    const resposta = await confirmarAcao({
      titulo: `Salvar ${chaves.length} ${chaves.length === 1 ? 'alteração' : 'alterações'}?`,
      texto: resumo,
      rotuloConfirmar: 'Salvar alterações',
      variante: 'positivo',
    });
    if (!resposta || !ativo) return;

    painel.querySelectorAll('button').forEach((b) => (b.disabled = true));
    try {
      await salvarConfiguracoes(mudancas, { autor: sessaoAtual()?.nome ?? 'Administrador' });
      mostrarAviso({ titulo: 'Configurações salvas', texto: 'As mudanças já valem e foram registradas na auditoria.' });
      if (ativo) await carregar();
    } catch {
      mostrarAviso({ tipo: 'erro', titulo: 'Não foi possível salvar', texto: 'Seus valores continuam na tela. Tente de novo.' });
      painel.querySelectorAll('button').forEach((b) => (b.disabled = false));
    }
  });

  painel.addEventListener('click', (evento) => {
    const acao = evento.target.closest('[data-acao]')?.dataset.acao;
    if (acao === 'tentar-novo' || acao === 'descartar') carregar();
  });

  carregar();
  return () => {
    ativo = false;
  };
}
