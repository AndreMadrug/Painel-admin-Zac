// Aviso rápido de sucesso ou falha depois de uma ação, sem travar a tela (RI-05).
import { esc } from '../lib/format.js';

function obterRegiao() {
  let regiao = document.getElementById('avisos');
  if (!regiao) {
    regiao = document.createElement('div');
    regiao.id = 'avisos';
    regiao.className = 'avisos';
    regiao.setAttribute('aria-live', 'polite');
    document.body.appendChild(regiao);
  }
  return regiao;
}

/**
 * mostrarAviso({ tipo: 'sucesso' | 'erro', titulo: 'Ação concluída', texto: 'A disputa foi negada.' })
 */
export function mostrarAviso({ tipo = 'sucesso', titulo, texto = '' }) {
  const aviso = document.createElement('div');
  aviso.className = `aviso${tipo === 'erro' ? ' aviso--erro' : ''}`;
  aviso.innerHTML = `<div class="aviso__titulo">${esc(titulo)}</div>${
    texto ? `<div class="aviso__texto">${esc(texto)}</div>` : ''
  }`;
  obterRegiao().appendChild(aviso);
  setTimeout(() => aviso.remove(), tipo === 'erro' ? 7000 : 4500);
}
