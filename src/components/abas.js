// Abas de uma tela principal (ex.: Usuários | Vendedores).
// A aba escolhida fica guardada: ao voltar do detalhe, a pessoa cai na mesma aba (RI-02).
import { lerEstado, salvarEstado } from '../lib/estado.js';
import { esc } from '../lib/format.js';

/**
 * montarAbas(container, {
 *   chave: 'usuarios-e-vendedores',
 *   abas: [ { id, rotulo, montar(painel) => funcaoDeLimpeza } ],
 *   padrao: 'usuarios',
 * })
 * Devolve { destruir }.
 */
export function montarAbas(container, { chave, abas, padrao }) {
  const chaveEstado = `abas:${chave}`;
  const salvo = lerEstado(chaveEstado, {});
  let atual = abas.some((a) => a.id === salvo.aba) ? salvo.aba : (padrao ?? abas[0].id);
  let limpar = null;

  container.innerHTML = `
    <div class="abas" role="tablist" aria-label="Seções da tela">
      ${abas
        .map(
          (a) => `<button class="abas__aba" type="button" role="tab" data-aba="${esc(a.id)}"
            id="aba-${esc(chave)}-${esc(a.id)}" aria-controls="painel-${esc(chave)}">${esc(a.rotulo)}</button>`
        )
        .join('')}
    </div>
    <div class="abas__painel" role="tabpanel" id="painel-${esc(chave)}"></div>`;

  const listaAbas = container.querySelector('[role="tablist"]');
  const painel = container.querySelector('[role="tabpanel"]');
  const botoes = [...listaAbas.querySelectorAll('[role="tab"]')];

  function mostrar(id, focar = false) {
    if (typeof limpar === 'function') limpar();
    atual = id;
    salvarEstado(chaveEstado, { aba: id });
    botoes.forEach((b) => {
      const ativa = b.dataset.aba === id;
      b.setAttribute('aria-selected', String(ativa));
      b.tabIndex = ativa ? 0 : -1;
      if (ativa && focar) b.focus();
    });
    painel.setAttribute('aria-labelledby', `aba-${chave}-${id}`);
    painel.innerHTML = '';
    limpar = abas.find((a) => a.id === id).montar(painel);
  }

  listaAbas.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-aba]');
    if (botao && botao.dataset.aba !== atual) mostrar(botao.dataset.aba);
  });

  // Setas esquerda e direita trocam de aba, como em qualquer lista de abas acessível.
  listaAbas.addEventListener('keydown', (evento) => {
    if (evento.key !== 'ArrowLeft' && evento.key !== 'ArrowRight') return;
    const i = botoes.findIndex((b) => b.dataset.aba === atual);
    const passo = evento.key === 'ArrowRight' ? 1 : botoes.length - 1;
    mostrar(botoes[(i + passo) % botoes.length].dataset.aba, true);
  });

  mostrar(atual);

  return {
    destruir() {
      if (typeof limpar === 'function') limpar();
      limpar = null;
    },
  };
}