// Esqueleto comum a todas as telas internas (RI-01):
// menu lateral, cabeçalho com nome do admin + botão Sair e trilha de navegação.
import { MENU } from '../config/app.js';
import { esc } from '../lib/format.js';
import { encerrarSessao } from '../lib/sessao.js';
import logoUrl from '../assets/logo-zac.png';

function iniciais(nome) {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('');
}

export function montarLayout(app, { menuAtivo, migalhas, sessao }) {
  const itensMenu = MENU.map((item) => {
    const ativo = item.id === menuAtivo;
    return `<li><a class="menu__item${ativo ? ' menu__item--ativo' : ''}" href="${item.rota}"${
      ativo ? ' aria-current="page"' : ''
    }>${esc(item.rotulo)}</a></li>`;
  }).join('');

  const trilha = migalhas
    .map((m, i) => {
      const ultima = i === migalhas.length - 1;
      return ultima
        ? `<li><span aria-current="page">${esc(m.rotulo)}</span></li>`
        : `<li><a href="${m.rota}">${esc(m.rotulo)}</a></li>`;
    })
    .join('');

  app.innerHTML = `
    <div class="shell">
      <aside class="menu" id="menu" aria-label="Menu do painel">
        <a class="menu__marca" href="#/visao-geral" aria-label="zac — ir para a visão geral">
          <img src="${logoUrl}" alt="zac Marketplace Comunitário" />
        </a>
        <span class="menu__sub">painel admin</span>
        <nav aria-label="Módulos"><ul class="menu__lista">${itensMenu}</ul></nav>
      </aside>

      <div class="shell__conteudo">
        <header class="cabecalho">
          <button class="cabecalho__menu" type="button" aria-label="Abrir menu" aria-controls="menu" aria-expanded="false">☰</button>
          <nav class="trilha" aria-label="Trilha de navegação"><ol>${trilha}</ol></nav>
          <div class="cabecalho__usuario">
            <span class="avatar" aria-hidden="true">${esc(iniciais(sessao.nome))}</span>
            <div>
              <span class="cabecalho__nome">${esc(sessao.nome)}</span>
              <button class="link-sair" type="button">Sair</button>
            </div>
          </div>
        </header>
        <main class="pagina" id="pagina" tabindex="-1"></main>
      </div>
    </div>`;

  const menu = app.querySelector('#menu');
  const botaoMenu = app.querySelector('.cabecalho__menu');

  botaoMenu.addEventListener('click', () => {
    const aberto = menu.classList.toggle('menu--aberto');
    botaoMenu.setAttribute('aria-expanded', String(aberto));
  });
  menu.addEventListener('click', (evento) => {
    if (evento.target.closest('a')) menu.classList.remove('menu--aberto');
  });

  app.querySelector('.link-sair').addEventListener('click', () => {
    encerrarSessao();
    location.hash = '#/login';
  });

  const pagina = app.querySelector('#pagina');
  pagina.focus({ preventScroll: true });
  return { pagina };
}
