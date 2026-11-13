// Janela com formulário (usada para cadastrar e editar). Valida cada campo na hora (RI-06).
import { esc } from '../lib/format.js';

/**
 * const valores = await abrirFormulario({
 *   titulo: 'Nova ação',
 *   rotuloConfirmar: 'Salvar',
 *   campos: [
 *     { nome, rotulo, tipo: 'texto'|'numero'|'textarea', valor, dica, min, max, maxLength }
 *   ],
 * });
 * valores === null -> cancelou. Todos os campos são obrigatórios.
 * Campos "numero" voltam como número.
 */
export function abrirFormulario({ titulo, campos, rotuloConfirmar = 'Salvar' }) {
  return new Promise((resolver) => {
    const janela = document.createElement('dialog');
    janela.className = 'modal';
    janela.setAttribute('aria-labelledby', 'modal-form-titulo');

    const htmlCampo = (c) => {
      const id = `mf-${c.nome}`;
      const comum = `id="${id}" name="${c.nome}" aria-describedby="${id}-erro"`;
      const valor = c.valor ?? '';
      const controle =
        c.tipo === 'textarea'
          ? `<textarea ${comum} rows="3"${c.maxLength ? ` maxlength="${c.maxLength}"` : ''}>${esc(valor)}</textarea>`
          : `<input ${comum} type="${c.tipo === 'numero' ? 'number' : 'text'}" value="${esc(valor)}"${
              c.tipo === 'numero' ? ' step="any" inputmode="decimal"' : ''
            }${c.maxLength ? ` maxlength="${c.maxLength}"` : ''} />`;
      return `<label class="campo" for="${id}">
        <span>${esc(c.rotulo)}</span>
        ${controle}
        ${c.dica ? `<span class="campo__dica">${esc(c.dica)}</span>` : ''}
        <span class="campo__erro" id="${id}-erro" role="alert"></span>
      </label>`;
    };

    janela.innerHTML = `
      <form class="modal__corpo" novalidate>
        <h2 id="modal-form-titulo">${esc(titulo)}</h2>
        ${campos.map(htmlCampo).join('')}
        <div class="modal__acoes">
          <button class="btn btn--neutro" type="button" data-cancelar>Cancelar</button>
          <button class="btn" type="submit">${esc(rotuloConfirmar)}</button>
        </div>
      </form>`;
    document.body.appendChild(janela);

    let resposta = null;
    const formulario = janela.querySelector('form');

    function erroDoCampo(c, texto) {
      if (!texto) return `Preencha o campo "${c.rotulo}".`;
      if (c.tipo === 'numero') {
        const numero = Number(texto.replace(',', '.'));
        if (Number.isNaN(numero)) return 'Digite apenas números.';
        if (c.min !== undefined && numero < c.min) return `O valor mínimo é ${c.min}.`;
        if (c.max !== undefined && numero > c.max) return `O valor máximo é ${c.max}.`;
      }
      return '';
    }

    function validar(c) {
      const campo = formulario.elements[c.nome];
      const mensagem = erroDoCampo(c, campo.value.trim());
      campo.toggleAttribute('aria-invalid', Boolean(mensagem));
      if (!mensagem) campo.removeAttribute('aria-invalid');
      else campo.setAttribute('aria-invalid', 'true');
      janela.querySelector(`#mf-${c.nome}-erro`).textContent = mensagem;
      return !mensagem;
    }

    campos.forEach((c) => formulario.elements[c.nome].addEventListener('blur', () => validar(c)));

    formulario.addEventListener('submit', (evento) => {
      evento.preventDefault();
      const invalidos = campos.filter((c) => !validar(c));
      if (invalidos.length) {
        formulario.elements[invalidos[0].nome].focus();
        return;
      }
      resposta = Object.fromEntries(
        campos.map((c) => {
          const texto = formulario.elements[c.nome].value.trim();
          return [c.nome, c.tipo === 'numero' ? Number(texto.replace(',', '.')) : texto];
        })
      );
      janela.close();
    });

    janela.querySelector('[data-cancelar]').addEventListener('click', () => janela.close());
    janela.addEventListener('close', () => {
      janela.remove();
      resolver(resposta);
    });

    janela.showModal();
    formulario.elements[campos[0].nome].focus();
  });
}
