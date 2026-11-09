// Configurações gerais do painel.

/** Tempo de duração da sessão do administrador, em minutos. */
export const SESSAO_MINUTOS = 30;

/** Itens do menu lateral (documento de requisitos, seção 2.1). */
export const MENU = [
  { id: 'visao-geral', rotulo: 'Visão geral', rota: '#/visao-geral' },
  { id: 'financeiro', rotulo: 'Financeiro', rota: '#/financeiro' },
  { id: 'disputas', rotulo: 'Disputas e reembolsos', rota: '#/disputas' },
  { id: 'usuarios-e-vendedores', rotulo: 'Usuários e vendedores', rota: '#/usuarios-e-vendedores' },
  { id: 'produtos-e-denuncias', rotulo: 'Produtos e denúncias', rota: '#/produtos-e-denuncias' },
  { id: 'locais', rotulo: 'Locais', rota: '#/locais' },
  { id: 'pedidos', rotulo: 'Pedidos', rota: '#/pedidos' },
  { id: 'impacto-e-suporte', rotulo: 'Impacto e suporte', rota: '#/impacto-e-suporte' },
  { id: 'sistema', rotulo: 'Sistema', rota: '#/sistema' },
];
