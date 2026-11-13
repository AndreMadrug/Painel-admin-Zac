// Dados de EXEMPLO do módulo Locais (sugestões, reivindicações e edições de lugares).
// As alterações ficam só na memória: ao recarregar a página, voltam ao começo.
import { simularRequisicao, simularAcao } from '../../lib/api.js';
import { diasAPartirDeHoje, paraDataHoraISO } from '../../lib/format.js';

/** Tipo de pedido: cada um é uma aba da tela Locais (RF-LOC-01). */
export const ROTULO_TIPO = {
  sugestao: 'Sugestão',
  reivindicacao: 'Reivindicação',
  edicao: 'Edição',
};

export const STATUS_LOCAL = {
  pendente: { rotulo: 'Pendente', variante: 'escuro' },
  aprovado: { rotulo: 'Aprovado', variante: 'verde' },
  rejeitado: { rotulo: 'Rejeitado', variante: 'coral' },
};

const momento = (diasAtras, hora = 10, minuto = 0) => {
  const data = diasAPartirDeHoje(-diasAtras);
  data.setHours(hora, minuto);
  return paraDataHoraISO(data);
};

/** Uma linha da comparação "dados atuais x dados propostos". */
const campo = (rotulo, atual, proposto) => ({ rotulo, atual, proposto });

// Coordenadas aproximadas de pontos do Cabo de Santo Agostinho (apenas exemplo).
const GAIBU = { lat: -8.329, lng: -34.944 };
const CALHETAS = { lat: -8.31, lng: -34.959 };
const CENTRO = { lat: -8.2867, lng: -35.0349 };
const SUAPE = { lat: -8.3917, lng: -34.9625 };
const PAIVA = { lat: -8.2425, lng: -34.9715 };

const LOCAIS = [
  // ---- Sugestões: lugares novos --------------------------------------------------
  {
    id: 'LOC-2101', tipo: 'sugestao', nome: 'Feira Orgânica de Gaibu', categoria: 'Feira', bairro: 'Gaibu',
    solicitante: 'Marta Oliveira', enviadoEm: momento(1), status: 'pendente',
    observacao: 'Feira de produtores locais, todo sábado de manhã.',
    campos: [
      campo('Nome', null, 'Feira Orgânica de Gaibu'),
      campo('Categoria', null, 'Feira'),
      campo('Endereço', null, 'Praça da Orla, s/n — Gaibu'),
      campo('Horário', null, 'Sábados, 6h às 12h'),
      campo('Telefone', null, '(81) 98888-1101'),
    ],
    coord: { atual: null, proposto: GAIBU },
  },
  {
    id: 'LOC-2102', tipo: 'sugestao', nome: 'Ponto de coleta de óleo de cozinha', categoria: 'Reciclagem', bairro: 'Centro',
    solicitante: 'Associação Cabo Limpo', enviadoEm: momento(3), status: 'pendente',
    observacao: 'Ponto fixo de coleta para reciclagem de óleo usado.',
    campos: [
      campo('Nome', null, 'Ponto de coleta de óleo de cozinha'),
      campo('Categoria', null, 'Reciclagem'),
      campo('Endereço', null, 'Rua Barão do Rio Branco, 210 — Centro'),
      campo('Horário', null, 'Segunda a sexta, 8h às 17h'),
      campo('Telefone', null, '(81) 98888-1102'),
    ],
    coord: { atual: null, proposto: CENTRO },
  },
  {
    id: 'LOC-2103', tipo: 'sugestao', nome: 'Horta comunitária de Paiva', categoria: 'Horta', bairro: 'Paiva',
    solicitante: 'João Batista Rocha', enviadoEm: momento(6), status: 'pendente',
    observacao: 'Horta mantida por moradores do bairro.',
    campos: [
      campo('Nome', null, 'Horta comunitária de Paiva'),
      campo('Categoria', null, 'Horta'),
      campo('Endereço', null, 'Rua das Mangueiras, 45 — Paiva'),
      campo('Horário', null, 'Todos os dias, 7h às 17h'),
      campo('Telefone', null, '—'),
    ],
    coord: { atual: null, proposto: PAIVA },
  },
  {
    id: 'LOC-2090', tipo: 'sugestao', nome: 'Quiosque Maré Mansa', categoria: 'Alimentação', bairro: 'Calhetas',
    solicitante: 'Zilda Ferreira', enviadoEm: momento(12), status: 'aprovado',
    campos: [
      campo('Nome', null, 'Quiosque Maré Mansa'),
      campo('Categoria', null, 'Alimentação'),
      campo('Endereço', null, 'Orla de Calhetas, quiosque 4'),
      campo('Horário', null, 'Todos os dias, 9h às 18h'),
      campo('Telefone', null, '(81) 98888-1190'),
    ],
    coord: { atual: null, proposto: CALHETAS },
    decisao: { tipo: 'aprovado', motivo: 'Dados conferidos e local existente.', em: momento(10) },
  },
  {
    id: 'LOC-2088', tipo: 'sugestao', nome: 'Loja de roupas do Pedro', categoria: 'Comércio', bairro: 'Centro',
    solicitante: 'Pedro Henrique', enviadoEm: momento(15), status: 'rejeitado',
    campos: [
      campo('Nome', null, 'Loja de roupas do Pedro'),
      campo('Categoria', null, 'Comércio'),
      campo('Endereço', null, 'Não informado'),
      campo('Horário', null, '—'),
      campo('Telefone', null, '—'),
    ],
    coord: { atual: null, proposto: CENTRO },
    decisao: { tipo: 'rejeitado', motivo: 'Endereço não informado e local fora do tema da plataforma.', em: momento(13) },
  },

  // ---- Reivindicações: alguém diz que é o responsável por um lugar --------------
  {
    id: 'LOC-2201', tipo: 'reivindicacao', nome: 'Pousada Brisa do Mar', categoria: 'Hospedagem', bairro: 'Gaibu',
    solicitante: 'Sônia Maria Lima', enviadoEm: momento(2), status: 'pendente',
    observacao: 'Diz ser a proprietária da pousada.',
    campos: [
      campo('Responsável', 'Sem responsável cadastrado', 'Sônia Maria Lima (proprietária)'),
      campo('Documento', '—', 'CNPJ ••.•••.•••/0001-52'),
      campo('Telefone de contato', '—', '(81) 98888-2201'),
      campo('Comprovação enviada', 'Nenhuma', 'alvara-pousada-2026.pdf'),
    ],
    coord: { atual: GAIBU, proposto: GAIBU },
  },
  {
    id: 'LOC-2202', tipo: 'reivindicacao', nome: 'Mercadinho do Seu Antônio', categoria: 'Comércio', bairro: 'Santo Inácio',
    solicitante: 'Antônio Carlos Pereira', enviadoEm: momento(5), status: 'pendente',
    campos: [
      campo('Responsável', 'Sem responsável cadastrado', 'Antônio Carlos Pereira (proprietário)'),
      campo('Documento', '—', 'CPF •••.•••.•••-45'),
      campo('Telefone de contato', '—', '(81) 98888-2202'),
      campo('Comprovação enviada', 'Nenhuma', 'conta-de-luz-mercadinho.pdf'),
    ],
    coord: { atual: CENTRO, proposto: CENTRO },
  },
  {
    id: 'LOC-2185', tipo: 'reivindicacao', nome: 'Padaria Pão Quente', categoria: 'Alimentação', bairro: 'Centro',
    solicitante: 'Rita de Cássia Souza', enviadoEm: momento(18), status: 'aprovado',
    campos: [
      campo('Responsável', 'Sem responsável cadastrado', 'Rita de Cássia Souza (proprietária)'),
      campo('Documento', '—', 'CNPJ ••.•••.•••/0001-18'),
      campo('Telefone de contato', '—', '(81) 98888-2185'),
      campo('Comprovação enviada', 'Nenhuma', 'contrato-social.pdf'),
    ],
    coord: { atual: CENTRO, proposto: CENTRO },
    decisao: { tipo: 'aprovado', motivo: 'Documento confere com o cadastro da empresa.', em: momento(16) },
  },
  {
    id: 'LOC-2180', tipo: 'reivindicacao', nome: 'Barraca da Praia de Calhetas', categoria: 'Alimentação', bairro: 'Calhetas',
    solicitante: 'Valdir Santos', enviadoEm: momento(22), status: 'rejeitado',
    campos: [
      campo('Responsável', 'Sem responsável cadastrado', 'Valdir Santos (proprietário)'),
      campo('Documento', '—', 'CPF •••.•••.•••-00'),
      campo('Telefone de contato', '—', '(81) 98888-2180'),
      campo('Comprovação enviada', 'Nenhuma', 'foto-selfie.jpg'),
    ],
    coord: { atual: CALHETAS, proposto: CALHETAS },
    decisao: { tipo: 'rejeitado', motivo: 'A comprovação enviada não prova a posse do local.', em: momento(20) },
  },

  // ---- Edições: mudanças em lugares que já existem ------------------------------
  {
    id: 'LOC-2301', tipo: 'edicao', nome: 'Mercado Público do Cabo', categoria: 'Mercado', bairro: 'Centro',
    solicitante: 'Luciana Matos', enviadoEm: momento(1), status: 'pendente',
    observacao: 'O mercado mudou o horário e o local no mapa estava errado.',
    campos: [
      campo('Nome', 'Mercado Público do Cabo', 'Mercado Público do Cabo'),
      campo('Categoria', 'Mercado', 'Mercado'),
      campo('Endereço', 'Rua Padre Cícero, 12 — Centro', 'Rua Padre Cícero, 112 — Centro'),
      campo('Horário', 'Segunda a sábado, 6h às 16h', 'Segunda a sábado, 6h às 18h'),
      campo('Telefone', '(81) 3521-0000', '(81) 3521-0000'),
    ],
    coord: { atual: { lat: -8.2905, lng: -35.0391 }, proposto: CENTRO },
  },
  {
    id: 'LOC-2302', tipo: 'edicao', nome: 'Praia de Calhetas', categoria: 'Praia', bairro: 'Calhetas',
    solicitante: 'Fernanda Costa', enviadoEm: momento(4), status: 'pendente',
    campos: [
      campo('Nome', 'Praia de Calhetas', 'Praia de Calhetas'),
      campo('Categoria', 'Praia', 'Praia'),
      campo('Endereço', 'Calhetas', 'Orla de Calhetas, acesso pela Rua do Farol'),
      campo('Horário', '—', 'Todos os dias, 24 horas'),
      campo('Telefone', '—', '—'),
    ],
    coord: { atual: { lat: -8.3, lng: -34.97 }, proposto: CALHETAS },
  },
  {
    id: 'LOC-2303', tipo: 'edicao', nome: 'Porto de Suape — Mirante', categoria: 'Turismo', bairro: 'Suape',
    solicitante: 'Roberto Alves', enviadoEm: momento(7), status: 'pendente',
    campos: [
      campo('Nome', 'Porto de Suape — Mirante', 'Mirante do Porto de Suape'),
      campo('Categoria', 'Turismo', 'Turismo'),
      campo('Endereço', 'Complexo de Suape', 'Complexo de Suape, acesso pela PE-60'),
      campo('Horário', '—', 'Todos os dias, 8h às 17h'),
      campo('Telefone', '—', '—'),
    ],
    coord: { atual: SUAPE, proposto: { lat: -8.3955, lng: -34.9588 } },
  },
  {
    id: 'LOC-2280', tipo: 'edicao', nome: 'Feira do Produtor', categoria: 'Feira', bairro: 'Paiva',
    solicitante: 'Patrícia Gomes', enviadoEm: momento(14), status: 'aprovado',
    campos: [
      campo('Nome', 'Feira do Produtor', 'Feira do Produtor'),
      campo('Categoria', 'Feira', 'Feira'),
      campo('Endereço', 'Paiva', 'Rua Principal, s/n — Paiva'),
      campo('Horário', 'Domingos, 6h às 11h', 'Domingos, 6h às 12h'),
      campo('Telefone', '—', '—'),
    ],
    coord: { atual: PAIVA, proposto: PAIVA },
    decisao: { tipo: 'aprovado', motivo: 'Informações confirmadas por telefone.', em: momento(12) },
  },
  {
    id: 'LOC-2275', tipo: 'edicao', nome: 'Cooperativa de Artesãs', categoria: 'Artesanato', bairro: 'Gaibu',
    solicitante: 'Marcos Vinícius', enviadoEm: momento(20), status: 'rejeitado',
    campos: [
      campo('Nome', 'Cooperativa de Artesãs', 'Loja do Marcos'),
      campo('Categoria', 'Artesanato', 'Comércio'),
      campo('Endereço', 'Gaibu', 'Gaibu'),
      campo('Horário', '—', '—'),
      campo('Telefone', '—', '(81) 98888-2275'),
    ],
    coord: { atual: GAIBU, proposto: GAIBU },
    decisao: { tipo: 'rejeitado', motivo: 'A mudança de nome não é da cooperativa e parece propaganda.', em: momento(18) },
  },
];

export function listarLocais(tipo) {
  return simularRequisicao(() => LOCAIS.filter((l) => l.tipo === tipo));
}

export function obterLocal(id) {
  return simularRequisicao(() => LOCAIS.find((l) => l.id === id) ?? null);
}

/** Quantos pedidos ainda esperam decisão (usado na Visão geral). */
export function contarLocaisAAprovar() {
  return LOCAIS.filter((l) => l.status === 'pendente').length;
}

/** RF-LOC-03: aprovar ou rejeitar, sempre com motivo. */
export function decidirLocal(id, { aprovar, motivo }) {
  return simularAcao(() => {
    const local = LOCAIS.find((l) => l.id === id);
    local.status = aprovar ? 'aprovado' : 'rejeitado';
    local.decisao = {
      tipo: aprovar ? 'aprovado' : 'rejeitado',
      motivo,
      em: paraDataHoraISO(new Date()),
    };
    return local;
  });
}
