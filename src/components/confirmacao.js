// Janela de confirmação para ações sensíveis (RI-03): reembolsar, negar, aprovar...
// Se "justificativa" for informada, o campo é obrigatório e o botão Confirmar não envia sem ele.
import { esc } from '../lib/format.js';

/**
 * const resposta = await confirmarAcao({
 *   titulo: 'Negar esta disputa?',
 *   rotuloConfirmar: 'Confirmar',
 *   variante: 'perigo',                       // 'perigo' (coral) ou 'positivo' (verde)
 *   justificativa: { rotulo: 'Justificativa' } // opcional
 * });
 * resposta === null            -> a pessoa cancelou
 * resposta.justificativa       -> texto digitado (quando houver o campo)
 */
export function confirmarAcao({
  titulo,
  texto = '',
  rotuloConfirmar = 'Confirmar',
  variante = 'perigo',
  justificativa = null,
}) {
  return new Promise((resolver) => {
    const janela = document.createElement('dialog');
    janela.className = 'modal';
    janela.setAttribute('aria-labelledby', 'modal-titulo');
    janela.innerHTML = `
      <form class="modal__corpo" novalidate>
        <h2 id="modal-titulo">${esc(titulo)}</h2>
        ${texto ? `<p class="nota">${esc(texto)}</p>` : ''}
        ${
          justificativa
            ? `<label class="campo">
                 <span>${esc(justificativa.rotulo ?? 'Justificativa')} (obrigatória)</span>
                 <textarea name="justificativa" rows="3" aria-describedby="modal-erro"></textarea>
                 <span class="campo__erro" id="modal-erro" role="alert"></span>
               </label>`
            : ''
        }
        <div class="modal__acoes">
          <button class="btn btn--neutro" type="button" data-cancelar>Cancelar</button>
          <button class="btn btn--${variante}" type="submit">${esc(rotuloConfirmar)}</button>
        </div>
      </form>`;
    document.body.appendChild(janela);

    let resposta = null;
    const formulario = janela.querySelector('form');
    const campo = janela.querySelector('textarea');

    formulario.addEventListener('submit', (evento) => {
      evento.preventDefault();
      if (campo) {
        const texto = campo.value.trim();
        if (!texto) {
          campo.setAttribute('aria-invalid', 'true');
          janela.querySelector('#modal-erro').textContent = 'Escreva a justificativa para continuar.';
          campo.focus();
          return;
        }
        resposta = { justificativa: texto };
      } else {
        resposta = {};
      }
      janela.close();
    });

    janela.querySelector('[data-cancelar]').addEventListener('click', () => janela.close());
    janela.addEventListener('close', () => {
      janela.remove();
      resolver(resposta);
    });

    janela.showModal();
    (campo ?? janela.querySelector('[data-cancelar]')).focus();
  });
}
