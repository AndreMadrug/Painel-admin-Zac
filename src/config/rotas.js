// Lista de todas as telas do painel.
// Para criar uma tela nova: crie o arquivo na pasta do módulo em src/pages/ e adicione uma linha aqui.
//
//  caminho   endereço da tela (":id" vira um parâmetro, ex.: /disputas/DSP-0312)
//  titulo    texto da aba do navegador
//  menu      item do menu lateral que fica destacado (id em config/app.js)
//  migalhas  trilha de navegação (breadcrumb) mostrada no cabeçalho
//  render    função que desenha a tela
//  publica   true = abre sem login
import { paginaLogin } from '../pages/login/login.js';
import { paginaVisaoGeral } from '../pages/visao-geral/visaoGeral.js';
import { paginaFinanceiro } from '../pages/financeiro/financeiro.js';
import { paginaFinanceiroDetalhe } from '../pages/financeiro/financeiroDetalhe.js';
import { paginaDisputas } from '../pages/disputas/disputas.js';
import { paginaDisputaDetalhe } from '../pages/disputas/disputaDetalhe.js';
import { paginaUsuariosVendedores } from '../pages/usuarios-vendedores/usuariosVendedores.js';
import { paginaUsuarioDetalhe } from '../pages/usuarios-vendedores/usuarioDetalhe.js';
import { paginaVendedorDetalhe } from '../pages/usuarios-vendedores/vendedorDetalhe.js';
import { paginaPedidos } from '../pages/pedidos/pedidos.js';
import { paginaPedidoDetalhe } from '../pages/pedidos/pedidoDetalhe.js';
import { paginaProdutosDenuncias } from '../pages/produtos-denuncias/produtosDenuncias.js';
import { paginaProdutoDetalhe } from '../pages/produtos-denuncias/produtoDetalhe.js';
import { paginaDenunciaDetalhe } from '../pages/produtos-denuncias/denunciaDetalhe.js';

export const ROTAS = [
  // 1 — Login do administrador
  { caminho: '/login', titulo: 'Entrar', publica: true, render: paginaLogin },

  // 2 — Visão geral
  {
    caminho: '/visao-geral',
    titulo: 'Visão geral',
    menu: 'visao-geral',
    migalhas: () => [{ rotulo: 'Visão geral' }],
    render: paginaVisaoGeral,
  },

  // 3 — Financeiro
  {
    caminho: '/financeiro',
    titulo: 'Financeiro',
    menu: 'financeiro',
    migalhas: () => [{ rotulo: 'Financeiro' }],
    render: paginaFinanceiro,
  },
  // 4 — Detalhe da movimentação
  {
    caminho: '/financeiro/:id',
    titulo: 'Detalhe da movimentação',
    menu: 'financeiro',
    migalhas: (p) => [
      { rotulo: 'Financeiro', rota: '#/financeiro' },
      { rotulo: `Movimentação ${p.id}` },
    ],
    render: paginaFinanceiroDetalhe,
  },

  // 5 — Disputas e reembolsos
  {
    caminho: '/disputas',
    titulo: 'Disputas e reembolsos',
    menu: 'disputas',
    migalhas: () => [{ rotulo: 'Disputas e reembolsos' }],
    render: paginaDisputas,
  },
  // 6 — Detalhe da disputa
  {
    caminho: '/disputas/:id',
    titulo: 'Detalhe da disputa',
    menu: 'disputas',
    migalhas: (p) => [
      { rotulo: 'Disputas e reembolsos', rota: '#/disputas' },
      { rotulo: `Disputa ${p.id}` },
    ],
    render: paginaDisputaDetalhe,
  },
    // Usuários e vendedores
  {
    caminho: '/usuarios-e-vendedores',
    titulo: 'Usuários e vendedores',
    menu: 'usuarios-e-vendedores',
    migalhas: () => [{ rotulo: 'Usuários e vendedores' }],
    render: paginaUsuariosVendedores,
  },
  // Detalhe do usuário
  {
    caminho: '/usuarios-e-vendedores/usuarios/:id',
    titulo: 'Detalhe do usuário',
    menu: 'usuarios-e-vendedores',
    migalhas: (p) => [
      { rotulo: 'Usuários e vendedores', rota: '#/usuarios-e-vendedores' },
      { rotulo: `Usuário ${p.id}` },
    ],
    render: paginaUsuarioDetalhe,
  },
  // Detalhe do vendedor
  {
    caminho: '/usuarios-e-vendedores/vendedores/:id',
    titulo: 'Detalhe do vendedor',
    menu: 'usuarios-e-vendedores',
    migalhas: (p) => [
      { rotulo: 'Usuários e vendedores', rota: '#/usuarios-e-vendedores' },
      { rotulo: `Vendedor ${p.id}` },
    ],
    render: paginaVendedorDetalhe,
  },

  // Pedidos
  {
    caminho: '/pedidos',
    titulo: 'Pedidos',
    menu: 'pedidos',
    migalhas: () => [{ rotulo: 'Pedidos' }],
    render: paginaPedidos,
  },
  // Detalhe do pedido
  {
    caminho: '/pedidos/:id',
    titulo: 'Detalhe do pedido',
    menu: 'pedidos',
    migalhas: (p) => [
      { rotulo: 'Pedidos', rota: '#/pedidos' },
      { rotulo: `Pedido ${p.id}` },
    ],
    render: paginaPedidoDetalhe,
  },
    // Produtos e denúncias
  {
    caminho: '/produtos-e-denuncias',
    titulo: 'Produtos e denúncias',
    menu: 'produtos-e-denuncias',
    migalhas: () => [{ rotulo: 'Produtos e denúncias' }],
    render: paginaProdutosDenuncias,
  },
  // Detalhe do produto
  {
    caminho: '/produtos-e-denuncias/produtos/:id',
    titulo: 'Detalhe do produto',
    menu: 'produtos-e-denuncias',
    migalhas: (p) => [
      { rotulo: 'Produtos e denúncias', rota: '#/produtos-e-denuncias' },
      { rotulo: `Produto ${p.id}` },
    ],
    render: paginaProdutoDetalhe,
  },
  // Detalhe da denúncia
  {
    caminho: '/produtos-e-denuncias/denuncias/:id',
    titulo: 'Detalhe da denúncia',
    menu: 'produtos-e-denuncias',
    migalhas: (p) => [
      { rotulo: 'Produtos e denúncias', rota: '#/produtos-e-denuncias' },
      { rotulo: `Denúncia ${p.id}` },
    ],
    render: paginaDenunciaDetalhe,
  },
];
