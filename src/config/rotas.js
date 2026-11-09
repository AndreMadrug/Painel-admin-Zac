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
];
