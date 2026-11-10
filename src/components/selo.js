// Selo de status: sempre mostra cor E texto (RI-09).
import { esc } from '../lib/format.js';

/** variante: 'azul' | 'verde' | 'escuro' | 'coral' | 'neutro' */
export function selo(texto, variante = 'azul') {
  const classe = variante === 'azul' ? '' : ` selo--${variante}`;
  return `<span class="selo${classe}">${esc(texto)}</span>`;
}
