// Tela 21 — Configurações e auditoria: duas abas.
import { montarAbas } from '../../components/abas.js';
import { abaConfiguracoes } from './configuracoes.js';
import { abaAuditoria } from './auditoria.js';

export function paginaSistema({ container }) {
  container.innerHTML = `
    <div class="pagina__topo">
      <div>
        <h1>Sistema</h1>
        <p class="pagina__subtitulo">Configurações da plataforma e histórico de tudo que a equipe fez.</p>
      </div>
    </div>
    <div data-abas></div>`;

  const abas = montarAbas(container.querySelector('[data-abas]'), {
    chave: 'sistema',
    padrao: 'configuracoes',
    abas: [
      { id: 'configuracoes', rotulo: 'Configurações', montar: abaConfiguracoes },
      { id: 'auditoria', rotulo: 'Auditoria', montar: abaAuditoria },
    ],
  });
  return () => abas.destruir();
}
