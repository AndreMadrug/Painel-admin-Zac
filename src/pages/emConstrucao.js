// Tela provisória dos módulos que ainda não foram feitos.
import { esc } from '../lib/format.js';

export function paginaEmConstrucao({ container, titulo }) {
  container.innerHTML = `
    <h1>${esc(titulo)}</h1>
    <div class="estado">
      <div class="estado__icone" aria-hidden="true">🚧</div>
      <p class="estado__titulo">Esta tela ainda está em desenvolvimento</p>
      <p class="estado__texto">Ela faz parte do MVP 1 e será entregue em uma próxima etapa.</p>
    </div>`;
}
