// Impacto e suporte: tela com duas abas, Impacto ISAC e Suporte.
import { montarAbas } from '../../components/abas.js';
import { abaImpacto } from './impactoIsac.js';
import { abaSuporte } from './suporte.js';

export function paginaImpactoSuporte({ container }) {
  container.innerHTML = `
    <div class="pagina__topo">
      <div>
        <h1>Impacto e suporte</h1>
        <p class="pagina__subtitulo">Ações apoiadas pelo ISAC e atendimento aos usuários.</p>
      </div>
    </div>
    <div data-abas></div>`;

  const abas = montarAbas(container.querySelector('[data-abas]'), {
    chave: 'impacto-e-suporte',
    padrao: 'impacto',
    abas: [
      { id: 'impacto', rotulo: 'Impacto ISAC', montar: abaImpacto },
      { id: 'suporte', rotulo: 'Suporte', montar: abaSuporte },
    ],
  });
  return () => abas.destruir();
}
