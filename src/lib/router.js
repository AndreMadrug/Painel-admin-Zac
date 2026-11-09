// Roteador simples: cada endereço depois do "#" abre uma tela.
// Exemplo: http://localhost:5173/#/financeiro abre a tela Financeiro.
import { ROTAS } from '../config/rotas.js';
import { MENU } from '../config/app.js';
import { sessaoAtual, sessaoExpirou, encerrarSessao } from './sessao.js';
import { montarLayout } from '../components/layout.js';
import { paginaEmConstrucao } from '../pages/emConstrucao.js';

let limparTelaAnterior = null;

/** Procura a rota que combina com o endereço e extrai parâmetros como ":id". */
function acharRota(caminho) {
  for (const rota of ROTAS) {
    const nomes = [];
    const padrao = rota.caminho.replace(/:([^/]+)/g, (_, nome) => {
      nomes.push(nome);
      return '([^/]+)';
    });
    const resultado = caminho.match(new RegExp(`^${padrao}$`));
    if (resultado) {
      const params = {};
      nomes.forEach((nome, i) => (params[nome] = decodeURIComponent(resultado[i + 1])));
      return { rota, params };
    }
  }
  return null;
}

function caminhoAtual() {
  const hash = location.hash.replace(/^#/, '') || '/';
  return hash.split('?')[0];
}

export function iniciarRouter() {
  window.addEventListener('hashchange', navegar);
  navegar();
}

function navegar() {
  const app = document.getElementById('app');
  if (limparTelaAnterior) {
    limparTelaAnterior();
    limparTelaAnterior = null;
  }

  const caminho = caminhoAtual();
  const sessao = sessaoAtual();
  const achada = acharRota(caminho);

  // Raiz do site: vai para a visão geral (ou para o login, sem sessão).
  if (caminho === '/') {
    location.replace(sessao ? '#/visao-geral' : '#/login');
    return;
  }

  // RF-AUT-02: páginas internas só abrem com sessão ativa.
  if (!achada?.rota.publica && !sessao) {
    const expirou = sessaoExpirou();
    encerrarSessao();
    location.replace(expirou ? '#/login?expirada=1' : '#/login');
    return;
  }

  // Quem já está logado não precisa ver o login de novo.
  if (achada?.rota.publica && sessao) {
    location.replace('#/visao-geral');
    return;
  }

  window.scrollTo(0, 0);

  if (achada) {
    const { rota, params } = achada;
    document.title = `${rota.titulo} — Painel zac`;

    if (rota.publica) {
      app.innerHTML = '';
      limparTelaAnterior = rota.render({ container: app, params });
      return;
    }

    const { pagina } = montarLayout(app, {
      menuAtivo: rota.menu,
      migalhas: rota.migalhas ? rota.migalhas(params) : [],
      sessao,
    });
    limparTelaAnterior = rota.render({ container: pagina, params });
    return;
  }

  // Item do menu cuja tela ainda não foi feita (telas da Pessoa B, por exemplo).
  const itemDoMenu = MENU.find((item) => item.rota === `#${caminho}`);
  if (itemDoMenu) {
    document.title = `${itemDoMenu.rotulo} — Painel zac`;
    const { pagina } = montarLayout(app, {
      menuAtivo: itemDoMenu.id,
      migalhas: [{ rotulo: itemDoMenu.rotulo }],
      sessao,
    });
    paginaEmConstrucao({ container: pagina, titulo: itemDoMenu.rotulo });
    return;
  }

  location.replace('#/visao-geral');
}

/** Chamado periodicamente: se a sessão acabou com o painel aberto, volta ao login com aviso. */
export function verificarSessao() {
  const achada = acharRota(caminhoAtual());
  if (achada?.rota.publica || sessaoAtual()) return;
  const expirou = sessaoExpirou();
  encerrarSessao();
  location.hash = expirou ? '#/login?expirada=1' : '#/login';
}
