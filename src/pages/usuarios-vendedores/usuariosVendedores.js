// Tela — Usuários e vendedores: lista com duas abas. Completar com os RF-... do documento.
import { montarAbas } from '../../components/abas.js';
import { montarLista } from '../../components/lista.js';
import { selo } from '../../components/selo.js';
import {
  listarUsuarios,
  listarVendedores,
  PAPEIS,
  STATUS_USUARIO,
  STATUS_VENDEDOR,
} from '../../modules/usuarios/dados.js';
import { normalizar, esc } from '../../lib/format.js';

function abaUsuarios(painel) {
  const lista = montarLista(painel, {
    chave: 'usuarios',
    nomeItens: 'usuários',
    filtros: [
      { nome: 'busca', tipo: 'texto', rotulo: 'Buscar usuário', placeholder: 'Buscar por nome, e-mail ou telefone…' },
      {
        nome: 'status', tipo: 'select', rotulo: 'Status', todos: 'Todos os status',
        opcoes: Object.entries(STATUS_USUARIO).map(([valor, s]) => ({ valor, rotulo: s.rotulo })),
      },
      {
        nome: 'papel', tipo: 'select', rotulo: 'Papel', todos: 'Todos os papéis',
        opcoes: PAPEIS.map((p) => ({ valor: p, rotulo: p })),
      },
    ],
    colunas: [
      {
        chave: 'nome', rotulo: 'Nome', ordenavel: true,
        render: (u) => `<a href="#/usuarios-e-vendedores/usuarios/${esc(u.id)}">${esc(u.nome)}</a><small>${esc(u.id)}</small>`,
      },
      { chave: 'telefone', rotulo: 'Telefone', ordenavel: true, render: (u) => esc(u.telefone) },
      {
        chave: 'status', rotulo: 'Status', ordenavel: true,
        valorOrdem: (u) => STATUS_USUARIO[u.status].rotulo,
        render: (u) => selo(STATUS_USUARIO[u.status].rotulo, STATUS_USUARIO[u.status].variante),
      },
      {
        chave: 'papeis', rotulo: 'Papel', ordenavel: true,
        valorOrdem: (u) => u.papeis.join(', '),
        render: (u) => esc(u.papeis.join(', ')),
      },
    ],
    ordemPadrao: { chave: 'nome', direcao: 'asc' },
    porPagina: 8,
    carregar: listarUsuarios,
    filtrar: (u, filtros) => {
      if (filtros.status && u.status !== filtros.status) return false;
      if (filtros.papel && !u.papeis.includes(filtros.papel)) return false;
      if (filtros.busca && !normalizar(`${u.nome} ${u.email} ${u.telefone} ${u.id}`).includes(normalizar(filtros.busca))) return false;
      return true;
    },
    href: (u) => `#/usuarios-e-vendedores/usuarios/${u.id}`,
  });
  return () => lista.destruir();
}

function abaVendedores(painel) {
  const lista = montarLista(painel, {
    chave: 'vendedores',
    nomeItens: 'vendedores',
    filtros: [
      { nome: 'busca', tipo: 'texto', rotulo: 'Buscar vendedor', placeholder: 'Buscar por loja, responsável ou categoria…' },
      {
        nome: 'status', tipo: 'select', rotulo: 'Verificação', todos: 'Todas as verificações',
        opcoes: Object.entries(STATUS_VENDEDOR).map(([valor, s]) => ({ valor, rotulo: s.rotulo })),
      },
    ],
    colunas: [
      {
        chave: 'loja', rotulo: 'Loja', ordenavel: true,
        render: (v) => `<a href="#/usuarios-e-vendedores/vendedores/${esc(v.id)}">${esc(v.loja)}</a><small>${esc(v.id)}</small>`,
      },
      { chave: 'responsavel', rotulo: 'Responsável', ordenavel: true, render: (v) => esc(v.responsavel) },
      { chave: 'categoria', rotulo: 'Categoria', ordenavel: true, render: (v) => esc(v.categoria) },
      { chave: 'produtos', rotulo: 'Produtos', numerica: true, ordenavel: true, render: (v) => String(v.produtos) },
      {
        chave: 'status', rotulo: 'Verificação', ordenavel: true,
        valorOrdem: (v) => STATUS_VENDEDOR[v.status].rotulo,
        render: (v) => selo(STATUS_VENDEDOR[v.status].rotulo, STATUS_VENDEDOR[v.status].variante),
      },
    ],
    ordemPadrao: { chave: 'loja', direcao: 'asc' },
    porPagina: 8,
    carregar: listarVendedores,
    filtrar: (v, filtros) => {
      if (filtros.status && v.status !== filtros.status) return false;
      if (filtros.busca && !normalizar(`${v.loja} ${v.responsavel} ${v.categoria} ${v.id}`).includes(normalizar(filtros.busca))) return false;
      return true;
    },
    href: (v) => `#/usuarios-e-vendedores/vendedores/${v.id}`,
  });
  return () => lista.destruir();
}

export function paginaUsuariosVendedores({ container }) {
  container.innerHTML = `
    <div class="pagina__topo">
      <div>
        <h1>Usuários e vendedores</h1>
        <p class="pagina__subtitulo">Contas da plataforma e lojas à espera de verificação.</p>
      </div>
    </div>
    <div data-abas></div>`;

  const abas = montarAbas(container.querySelector('[data-abas]'), {
    chave: 'usuarios-e-vendedores',
    padrao: 'usuarios',
    abas: [
      { id: 'usuarios', rotulo: 'Usuários', montar: abaUsuarios },
      { id: 'vendedores', rotulo: 'Vendedores', montar: abaVendedores },
    ],
  });

  return () => abas.destruir();
}