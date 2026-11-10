// Os estados que toda tela precisa ter (RI-04): carregando, lista vazia e erro.
// Cada função devolve um pedaço de HTML para colocar na tela.
import { esc } from '../lib/format.js';

/** Esqueleto mostrado enquanto os dados chegam. */
export function htmlCarregando(linhas = 6) {
  const barras = Array.from({ length: linhas }, () => '<span></span>').join('');
  return `<div class="esqueleto" role="status" aria-label="Carregando"><span class="sr-only">Carregando…</span>${barras}</div>`;
}

/** Mensagem de "nenhum resultado" com botão para limpar os filtros. */
export function htmlListaVazia({
  titulo = 'Nenhum resultado',
  texto = 'Não encontramos nada com os filtros escolhidos.',
  botao = 'Limpar filtros',
} = {}) {
  return `
    <div class="estado">
      <div class="estado__icone" aria-hidden="true">🔍</div>
      <p class="estado__titulo">${esc(titulo)}</p>
      <p class="estado__texto">${esc(texto)}</p>
      ${botao ? `<button class="btn" type="button" data-acao="limpar-filtros">${esc(botao)}</button>` : ''}
    </div>`;
}

/** Mensagem de erro em português com botão "Tentar de novo". */
export function htmlErro({
  titulo = 'Não foi possível carregar',
  texto = 'Verifique sua conexão e tente de novo.',
} = {}) {
  return `
    <div class="estado estado--erro" role="alert">
      <p class="estado__titulo">${esc(titulo)}</p>
      <p class="estado__texto">${esc(texto)}</p>
      <button class="btn btn--perigo" type="button" data-acao="tentar-novo">Tentar de novo</button>
    </div>`;
}
