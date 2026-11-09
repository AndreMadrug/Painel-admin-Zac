// Lista reutilizável: busca, filtros, ordenação, paginação e os estados de tela.
// Os filtros ficam guardados e continuam preenchidos ao voltar do detalhe (RI-02).
import { esc } from '../lib/format.js';
import { lerEstado, salvarEstado } from '../lib/estado.js';
import { htmlCarregando, htmlListaVazia, htmlErro } from './estados.js';

const comparador = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' });

function htmlFiltro(filtro) {
  const id = `filtro-${filtro.nome}`;
  if (filtro.tipo === 'select') {
    const opcoes = filtro.opcoes
      .map((o) => `<option value="${esc(o.valor)}">${esc(o.rotulo)}</option>`)
      .join('');
    return `<div>
      <label class="sr-only" for="${id}">${esc(filtro.rotulo)}</label>
      <select id="${id}" name="${filtro.nome}"><option value="">${esc(filtro.todos ?? 'Todos')}</option>${opcoes}</select>
    </div>`;
  }
  return `<div class="filtros__busca">
    <label class="sr-only" for="${id}">${esc(filtro.rotulo)}</label>
    <input id="${id}" type="search" name="${filtro.nome}" placeholder="${esc(filtro.placeholder ?? '')}" autocomplete="off" />
  </div>`;
}

/** Lista os números de página a mostrar, com "…" quando há saltos. */
function paginasVisiveis(atual, total) {
  const numeros = [...new Set([1, total, atual - 1, atual, atual + 1])]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const resultado = [];
  numeros.forEach((n, i) => {
    if (i > 0 && n - numeros[i - 1] > 1) resultado.push('…');
    resultado.push(n);
  });
  return resultado;
}

/**
 * montarLista(container, {
 *   chave: 'disputas',                      // nome usado para lembrar os filtros
 *   nomeItens: 'disputas',                  // aparece em "Mostrando 1–10 de 25 disputas"
 *   filtros: [ { nome, tipo: 'texto'|'select', rotulo, placeholder, todos, opcoes } ],
 *   colunas: [ { chave, rotulo, ordenavel, numerica, valorOrdem(item), render(item) } ],
 *   ordemPadrao: { chave: 'data', direcao: 'desc' },
 *   porPagina: 10,
 *   carregar: async () => [...],            // devolve todos os itens
 *   filtrar: (item, filtros) => true/false,
 *   href: (item) => '#/algum/caminho',      // para onde vai ao clicar na linha
 * })
 * Devolve { redesenhar, destruir }.
 */
export function montarLista(container, cfg) {
  const chaveEstado = `lista:${cfg.chave}`;
  const filtrosPadrao = Object.fromEntries(cfg.filtros.map((f) => [f.nome, '']));
  const salvo = lerEstado(chaveEstado, {});
  const estado = {
    filtros: { ...filtrosPadrao, ...(salvo.filtros ?? {}) },
    ordem: salvo.ordem ?? cfg.ordemPadrao,
    pagina: salvo.pagina ?? 1,
  };
  const porPagina = cfg.porPagina ?? 10;
  let dados = [];
  let ativo = true;

  container.innerHTML = `
    <form class="filtros" role="search" aria-label="Buscar e filtrar">${cfg.filtros.map(htmlFiltro).join('')}</form>
    <div data-area="resultado"></div>`;
  const formulario = container.querySelector('form');
  const area = container.querySelector('[data-area="resultado"]');

  const guardar = () => salvarEstado(chaveEstado, estado);
  const preencherFiltros = () =>
    cfg.filtros.forEach((f) => (formulario.elements[f.nome].value = estado.filtros[f.nome]));
  preencherFiltros();

  function itensFiltrados() {
    const itens = dados.filter((item) => cfg.filtrar(item, estado.filtros));
    const coluna = cfg.colunas.find((c) => c.chave === estado.ordem.chave);
    if (coluna) {
      const sentido = estado.ordem.direcao === 'desc' ? -1 : 1;
      const valor = (item) => (coluna.valorOrdem ? coluna.valorOrdem(item) : item[coluna.chave]);
      itens.sort((a, b) => {
        const va = valor(a);
        const vb = valor(b);
        const resultado =
          typeof va === 'number' && typeof vb === 'number' ? va - vb : comparador.compare(String(va), String(vb));
        return resultado * sentido;
      });
    }
    return itens;
  }

  function desenhar(seletorFoco) {
    const itens = itensFiltrados();

    if (itens.length === 0) {
      area.innerHTML = dados.length
        ? htmlListaVazia()
        : htmlListaVazia({
            titulo: 'Nada por aqui ainda',
            texto: `Ainda não há ${cfg.nomeItens ?? 'registros'} para mostrar.`,
            botao: '',
          });
      return;
    }

    const totalPaginas = Math.ceil(itens.length / porPagina);
    estado.pagina = Math.min(Math.max(1, estado.pagina), totalPaginas);
    const visiveis = itens.slice((estado.pagina - 1) * porPagina, estado.pagina * porPagina);

    const cabecalho = cfg.colunas
      .map((c) => {
        const classe = c.numerica ? ' class="num"' : '';
        if (!c.ordenavel) return `<th scope="col"${classe}><span>${esc(c.rotulo)}</span></th>`;
        const ativa = estado.ordem.chave === c.chave;
        const crescente = estado.ordem.direcao !== 'desc';
        const aria = ativa ? (crescente ? 'ascending' : 'descending') : 'none';
        const seta = ativa ? (crescente ? ' ▲' : ' ▼') : '';
        return `<th scope="col"${classe} aria-sort="${aria}"><button type="button" data-ordenar="${c.chave}">${esc(
          c.rotulo
        )}<span aria-hidden="true">${seta}</span></button></th>`;
      })
      .join('');

    const linhas = visiveis
      .map(
        (item) =>
          `<tr class="linha-clicavel" data-href="${esc(cfg.href(item))}">${cfg.colunas
            .map((c) => `<td${c.numerica ? ' class="num"' : ''}>${c.render(item)}</td>`)
            .join('')}</tr>`
      )
      .join('');

    const primeiro = (estado.pagina - 1) * porPagina + 1;
    const ultimo = Math.min(itens.length, estado.pagina * porPagina);
    const botoesPagina = paginasVisiveis(estado.pagina, totalPaginas)
      .map((n) =>
        n === '…'
          ? '<span aria-hidden="true">…</span>'
          : `<button type="button" data-pagina="${n}" aria-label="Página ${n}"${
              n === estado.pagina ? ' aria-current="page"' : ''
            }>${n}</button>`
      )
      .join('');

    area.innerHTML = `
      <div class="tabela-rolagem">
        <table class="tabela">
          <thead><tr>${cabecalho}</tr></thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
      <div class="paginacao">
        <p role="status">Mostrando ${primeiro}–${ultimo} de ${itens.length} ${esc(cfg.nomeItens ?? 'resultados')}</p>
        <nav aria-label="Paginação">
          <div class="paginacao__botoes">
            <button type="button" data-pagina="${estado.pagina - 1}"${estado.pagina === 1 ? ' disabled' : ''}>Anterior</button>
            ${botoesPagina}
            <button type="button" data-pagina="${estado.pagina + 1}"${
              estado.pagina === totalPaginas ? ' disabled' : ''
            }>Próxima</button>
          </div>
        </nav>
      </div>`;

    if (seletorFoco) area.querySelector(seletorFoco)?.focus();
  }

  async function carregar() {
    area.innerHTML = htmlCarregando();
    try {
      dados = await cfg.carregar();
    } catch {
      if (ativo) area.innerHTML = htmlErro();
      return;
    }
    if (ativo) desenhar();
  }

  formulario.addEventListener('submit', (evento) => evento.preventDefault());
  formulario.addEventListener('input', () => {
    cfg.filtros.forEach((f) => (estado.filtros[f.nome] = formulario.elements[f.nome].value));
    estado.pagina = 1;
    guardar();
    desenhar();
  });

  area.addEventListener('click', (evento) => {
    const alvo = evento.target;

    const ordenar = alvo.closest('[data-ordenar]');
    if (ordenar) {
      const chave = ordenar.dataset.ordenar;
      const mesma = estado.ordem.chave === chave;
      estado.ordem = { chave, direcao: mesma && estado.ordem.direcao !== 'desc' ? 'desc' : 'asc' };
      estado.pagina = 1;
      guardar();
      desenhar(`[data-ordenar="${chave}"]`);
      return;
    }

    const pagina = alvo.closest('[data-pagina]');
    if (pagina) {
      estado.pagina = Number(pagina.dataset.pagina);
      guardar();
      desenhar('[aria-current="page"]');
      return;
    }

    const acao = alvo.closest('[data-acao]')?.dataset.acao;
    if (acao === 'limpar-filtros') {
      estado.filtros = { ...filtrosPadrao };
      estado.pagina = 1;
      preencherFiltros();
      guardar();
      desenhar();
      return;
    }
    if (acao === 'tentar-novo') {
      carregar();
      return;
    }

    // Clicar em qualquer ponto da linha abre o detalhe.
    const linha = alvo.closest('tr[data-href]');
    if (linha && !alvo.closest('a, button')) location.hash = linha.dataset.href;
  });

  carregar();

  return {
    /** Refaz a lista com os dados que já estão na memória (ex.: o período mudou). */
    redesenhar() {
      estado.pagina = 1;
      guardar();
      if (dados.length) desenhar();
    },
    destruir() {
      ativo = false;
    },
  };
}
