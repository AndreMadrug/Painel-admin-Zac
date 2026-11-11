// Dados de EXEMPLO do módulo Produtos e denúncias.
// As alterações ficam só na memória: ao recarregar a página, voltam ao começo.
import { simularRequisicao, simularAcao } from '../../lib/api.js';
import { diasAPartirDeHoje, paraDataHoraISO } from '../../lib/format.js';

export const STATUS_PRODUTO = {
  em_analise: { rotulo: 'Em análise', variante: 'escuro' },
  aprovado: { rotulo: 'Aprovado', variante: 'verde' },
  oculto: { rotulo: 'Oculto', variante: 'azul' },
  removido: { rotulo: 'Removido', variante: 'coral' },
};

export const STATUS_DENUNCIA = {
  aberta: { rotulo: 'Aberta', variante: 'azul' },
  mantida: { rotulo: 'Conteúdo mantido', variante: 'verde' },
  removida: { rotulo: 'Conteúdo removido', variante: 'coral' },
  encerrada: { rotulo: 'Encerrada', variante: 'escuro' },
};

export const MOTIVOS_DENUNCIA = [
  'Produto proibido',
  'Descrição enganosa',
  'Linguagem ofensiva',
  'Falsificação',
  'Preço abusivo',
];

const momento = (diasAtras, hora = 10, minuto = 0) => {
  const data = diasAPartirDeHoje(-diasAtras);
  data.setHours(hora, minuto);
  return paraDataHoraISO(data);
};

const PRODUTOS = [
  {
    id: 'PRD-3001', nome: 'Bolo de rolo tradicional', vendedor: 'Doces da Vovó', categoria: 'Doces e salgados',
    preco: 89.9, estoque: 14, status: 'aprovado', enviadoEm: momento(40),
    descricao: 'Bolo de rolo de goiabada, feito na hora, 1 kg.',
    fotos: [{ nome: 'bolo-frente.jpg' }, { nome: 'bolo-fatia.jpg' }],
  },
  {
    id: 'PRD-3002', nome: 'Mel silvestre 500 g', vendedor: 'Mel do Cabo', categoria: 'Alimentos naturais',
    preco: 66.5, estoque: 30, status: 'aprovado', enviadoEm: momento(35),
    descricao: 'Mel puro de produtores da região, pote de vidro.',
    fotos: [{ nome: 'mel-pote.jpg' }],
  },
  {
    id: 'PRD-3003', nome: 'Cesta de palha grande', vendedor: 'Artesanato do Cabo', categoria: 'Artesanato',
    preco: 105.0, estoque: 6, status: 'aprovado', enviadoEm: momento(30),
    descricao: 'Cesta trançada à mão, 40 cm de diâmetro.',
    fotos: [{ nome: 'cesta-1.jpg' }, { nome: 'cesta-2.jpg' }],
  },
  {
    id: 'PRD-3004', nome: 'Azeite extra virgem importado', vendedor: 'Sabores da Praia', categoria: 'Alimentos',
    preco: 56.2, estoque: 22, status: 'aprovado', enviadoEm: momento(25),
    descricao: 'Azeite 500 ml. Anúncio diz "100% importado da Itália".',
    fotos: [{ nome: 'azeite.jpg' }],
  },
  {
    id: 'PRD-3005', nome: 'Cesta de hortaliças orgânicas', vendedor: 'Sítio Verde', categoria: 'Hortifrúti',
    preco: 48.0, estoque: 10, status: 'em_analise', enviadoEm: momento(2),
    descricao: 'Alface, coentro, cebolinha e tomate colhidos na semana.',
    fotos: [{ nome: 'cesta-horta.jpg' }],
  },
  {
    id: 'PRD-3006', nome: 'Jogo de canecas de cerâmica', vendedor: 'Cerâmica da Enseada', categoria: 'Artesanato',
    preco: 140.0, estoque: 5, status: 'em_analise', enviadoEm: momento(1),
    descricao: 'Quatro canecas pintadas à mão.',
    fotos: [{ nome: 'canecas-1.jpg' }, { nome: 'canecas-2.jpg' }],
  },
  {
    id: 'PRD-3007', nome: 'Tênis esportivo (réplica)', vendedor: 'Sabores da Praia', categoria: 'Outros',
    preco: 79.0, estoque: 8, status: 'oculto', enviadoEm: momento(18),
    descricao: 'Tênis de marca famosa a preço muito abaixo do mercado.',
    fotos: [{ nome: 'tenis.jpg' }],
    decisao: { motivo: 'Suspeita de falsificação, em análise.', em: momento(5) },
  },
  {
    id: 'PRD-3008', nome: 'Remédio natural milagroso', vendedor: 'Doces da Vovó', categoria: 'Outros',
    preco: 35.0, estoque: 40, status: 'removido', enviadoEm: momento(22),
    descricao: 'Promete cura de doenças sem comprovação.',
    fotos: [],
    decisao: { motivo: 'Produto proibido: promessa de cura.', em: momento(10) },
  },
];

const DENUNCIAS = [
  {
    id: 'DEN-0501', alvoTipo: 'Produto', alvoId: 'PRD-3004', alvoNome: 'Azeite extra virgem importado',
    motivo: 'Descrição enganosa', denunciante: 'Roberto Alves', status: 'aberta', abertaEm: momento(2),
    conteudo: 'Azeite 500 ml. Anúncio diz "100% importado da Itália".',
    descricao: 'O rótulo que recebi diz que é produzido no Brasil.',
  },
  {
    id: 'DEN-0502', alvoTipo: 'Produto', alvoId: 'PRD-3007', alvoNome: 'Tênis esportivo (réplica)',
    motivo: 'Falsificação', denunciante: 'Ana Beatriz Souza', status: 'aberta', abertaEm: momento(4),
    conteudo: 'Tênis de marca famosa a preço muito abaixo do mercado.',
    descricao: 'A foto usa a logomarca da marca, mas o preço indica réplica.',
  },
  {
    id: 'DEN-0503', alvoTipo: 'Avaliação', alvoId: 'AVL-8841', alvoNome: 'Avaliação em "Mel silvestre 500 g"',
    motivo: 'Linguagem ofensiva', denunciante: 'Mel do Cabo', status: 'aberta', abertaEm: momento(1),
    conteudo: 'Avaliação com xingamentos contra o vendedor.',
    descricao: 'O comentário ofende a loja e usa palavrões.',
  },
  {
    id: 'DEN-0498', alvoTipo: 'Produto', alvoId: 'PRD-3008', alvoNome: 'Remédio natural milagroso',
    motivo: 'Produto proibido', denunciante: 'Fernanda Costa', status: 'removida', abertaEm: momento(12),
    conteudo: 'Promete cura de doenças sem comprovação.',
    descricao: 'Anúncio promete curar doenças graves.',
    decisao: { tipo: 'removida', motivo: 'Promessa de cura não é permitida.', em: momento(10) },
  },
  {
    id: 'DEN-0495', alvoTipo: 'Produto', alvoId: 'PRD-3003', alvoNome: 'Cesta de palha grande',
    motivo: 'Preço abusivo', denunciante: 'Carlos Henrique Lima', status: 'mantida', abertaEm: momento(16),
    conteudo: 'Cesta trançada à mão, 40 cm de diâmetro.',
    descricao: 'Acho o preço alto demais para uma cesta de palha.',
    decisao: { tipo: 'mantida', motivo: 'Preço compatível com o trabalho artesanal.', em: momento(14) },
  },
  {
    id: 'DEN-0490', alvoTipo: 'Avaliação', alvoId: 'AVL-8702', alvoNome: 'Avaliação em "Bolo de rolo tradicional"',
    motivo: 'Linguagem ofensiva', denunciante: 'Doces da Vovó', status: 'encerrada', abertaEm: momento(25),
    conteudo: 'Comentário com ofensas pessoais.',
    descricao: 'O comentário ataca a vendedora.',
    decisao: { tipo: 'removida', motivo: 'Ofensa pessoal.', em: momento(23) },
  },
];

// ---- Produtos ----------------------------------------------------------------

export function listarProdutos() {
  return simularRequisicao(() => PRODUTOS);
}

export function obterProduto(id) {
  return simularRequisicao(() => PRODUTOS.find((p) => p.id === id) ?? null);
}

/** Aprovar, ocultar ou remover. Ocultar e remover levam um motivo. */
export function alterarStatusProduto(id, { status, motivo }) {
  return simularAcao(() => {
    const produto = PRODUTOS.find((p) => p.id === id);
    produto.status = status;
    produto.decisao = motivo ? { motivo, em: paraDataHoraISO(new Date()) } : null;
    return produto;
  });
}

// ---- Denúncias ---------------------------------------------------------------

export function listarDenuncias() {
  return simularRequisicao(() => DENUNCIAS);
}

export function obterDenuncia(id) {
  return simularRequisicao(() => DENUNCIAS.find((d) => d.id === id) ?? null);
}

/** Manter ou remover o conteúdo denunciado, sempre com motivo. */
export function decidirDenuncia(id, { remover, motivo }) {
  return simularAcao(() => {
    const denuncia = DENUNCIAS.find((d) => d.id === id);
    const agora = paraDataHoraISO(new Date());
    denuncia.status = remover ? 'removida' : 'mantida';
    denuncia.decisao = { tipo: remover ? 'removida' : 'mantida', motivo, em: agora };

    // Se o conteúdo era um produto e foi removido, o produto sai do ar também.
    const produto = remover && denuncia.alvoTipo === 'Produto' ? PRODUTOS.find((p) => p.id === denuncia.alvoId) : null;
    if (produto) {
      produto.status = 'removido';
      produto.decisao = { motivo: `Removido pela denúncia ${denuncia.id}: ${motivo}`, em: agora };
    }
    return denuncia;
  });
}

export function encerrarDenuncia(id) {
  return simularAcao(() => {
    const denuncia = DENUNCIAS.find((d) => d.id === id);
    denuncia.status = 'encerrada';
    return denuncia;
  });
}

/** Quantas denúncias ainda esperam decisão (a Visão geral pode usar para o atalho). */
export function contarDenunciasAbertas() {
  return DENUNCIAS.filter((d) => d.status === 'aberta').length;
}