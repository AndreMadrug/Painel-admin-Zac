// Dados de EXEMPLO do módulo Usuários e vendedores.
// As alterações ficam só na memória: ao recarregar a página, voltam ao começo.
import { simularRequisicao, simularAcao } from '../../lib/api.js';
import { diasAPartirDeHoje, paraDataHoraISO } from '../../lib/format.js';

export const PAPEIS = ['Comprador', 'Vendedor', 'Moderador'];

export const STATUS_USUARIO = {
  ativo: { rotulo: 'Ativo', variante: 'verde' },
  restrito: { rotulo: 'Restrito', variante: 'escuro' },
  bloqueado: { rotulo: 'Bloqueado', variante: 'coral' },
};

export const STATUS_VENDEDOR = {
  em_verificacao: { rotulo: 'Em verificação', variante: 'escuro' },
  verificado: { rotulo: 'Verificado', variante: 'verde' },
  reprovado: { rotulo: 'Reprovado', variante: 'coral' },
  suspenso: { rotulo: 'Suspenso', variante: 'coral' },
};

const momento = (diasAtras, hora = 10, minuto = 0) => {
  const data = diasAPartirDeHoje(-diasAtras);
  data.setHours(hora, minuto);
  return paraDataHoraISO(data);
};
const CIDADE = 'Cabo de Santo Agostinho';
const endereco = (apelido, rua, bairro) => ({ apelido, rua, bairro, cidade: CIDADE });

const USUARIOS = [
  {
    id: 'USR-1042', nome: 'Ana Beatriz Souza', email: 'ana.souza@exemplo.com', telefone: '(81) 99999-0101',
    status: 'ativo', papeis: ['Comprador'], criadoEm: momento(120), pedidos: 12,
    enderecos: [endereco('Casa', 'Rua das Palmeiras, 120', 'Centro')],
  },
  {
    id: 'USR-1043', nome: 'Carlos Henrique Lima', email: 'carlos.lima@exemplo.com', telefone: '(81) 99999-0102',
    status: 'ativo', papeis: ['Comprador'], criadoEm: momento(95), pedidos: 7,
    enderecos: [endereco('Casa', 'Av. Beira-Mar, 845', 'Gaibu'), endereco('Trabalho', 'Rua do Sol, 33', 'Santo Inácio')],
  },
  {
    id: 'USR-1044', nome: 'Juliana Ferreira', email: 'juliana.f@exemplo.com', telefone: '(81) 99999-0103',
    status: 'ativo', papeis: ['Comprador', 'Vendedor'], criadoEm: momento(210), pedidos: 21,
    enderecos: [endereco('Casa', 'Travessa das Flores, 9', 'Charneca')],
  },
  {
    id: 'USR-1045', nome: 'Roberto Alves', email: 'roberto.alves@exemplo.com', telefone: '(81) 99999-0104',
    status: 'restrito', papeis: ['Comprador'], criadoEm: momento(60), pedidos: 5,
    enderecos: [endereco('Casa', 'Rua do Sol, 77', 'Santo Inácio')],
    restricao: { motivo: 'Três pedidos cancelados seguidos após o pagamento.', em: momento(6) },
  },
  {
    id: 'USR-1046', nome: 'Patrícia Gomes', email: 'patricia.gomes@exemplo.com', telefone: '(81) 99999-0105',
    status: 'ativo', papeis: ['Comprador'], criadoEm: momento(30), pedidos: 3,
    enderecos: [endereco('Casa', 'Rua das Palmeiras, 18', 'Centro')],
  },
  {
    id: 'USR-1047', nome: 'Marcos Vinícius', email: 'marcos.v@exemplo.com', telefone: '(81) 99999-0106',
    status: 'bloqueado', papeis: ['Comprador'], criadoEm: momento(75), pedidos: 2,
    enderecos: [endereco('Casa', 'Av. Beira-Mar, 12', 'Gaibu')],
    restricao: { motivo: 'Tentativa de fraude em pagamento.', em: momento(12) },
  },
  {
    id: 'USR-1048', nome: 'Fernanda Costa', email: 'fernanda.costa@exemplo.com', telefone: '(81) 99999-0107',
    status: 'ativo', papeis: ['Comprador'], criadoEm: momento(150), pedidos: 9,
    enderecos: [endereco('Casa', 'Travessa das Flores, 40', 'Charneca')],
  },
  {
    id: 'USR-1049', nome: 'Luciana Matos', email: 'luciana.matos@exemplo.com', telefone: '(81) 99999-0108',
    status: 'ativo', papeis: ['Comprador', 'Vendedor'], criadoEm: momento(180), pedidos: 14,
    enderecos: [endereco('Casa', 'Rua do Sol, 5', 'Santo Inácio')],
  },
  {
    id: 'USR-1050', nome: 'Eduardo Pires', email: 'eduardo.pires@exemplo.com', telefone: '(81) 99999-0109',
    status: 'ativo', papeis: ['Comprador', 'Moderador'], criadoEm: momento(300), pedidos: 4,
    enderecos: [endereco('Casa', 'Rua das Palmeiras, 200', 'Centro')],
  },
];

const VENDEDORES = [
  {
    id: 'VND-0201', loja: 'Doces da Vovó', responsavel: 'Maria das Dores Lima', categoria: 'Doces e salgados',
    documento: '***.482.915-**', status: 'verificado', enviadoEm: momento(200), produtos: 18, vendas: 8420.5,
    descricao: 'Doces caseiros e bolos por encomenda, feitos no Cabo.',
  },
  {
    id: 'VND-0202', loja: 'Mel do Cabo', responsavel: 'José Carlos Ramos', categoria: 'Alimentos naturais',
    documento: '**.731.204/****-**', status: 'verificado', enviadoEm: momento(170), produtos: 9, vendas: 5310.0,
    descricao: 'Mel de produtores da região, em potes de 250 g e 500 g.',
  },
  {
    id: 'VND-0203', loja: 'Artesanato do Cabo', responsavel: 'Rita de Cássia Nunes', categoria: 'Artesanato',
    documento: '***.095.338-**', status: 'verificado', enviadoEm: momento(140), produtos: 26, vendas: 12780.9,
    descricao: 'Peças de palha, crochê e madeira feitas por artesãs locais.',
  },
  {
    id: 'VND-0204', loja: 'Sabores da Praia', responsavel: 'Paulo Henrique Dias', categoria: 'Alimentos',
    documento: '**.554.870/****-**', status: 'suspenso', enviadoEm: momento(110), produtos: 11, vendas: 3290.0,
    descricao: 'Azeites, geleias e conservas artesanais.',
    decisao: { motivo: 'Várias disputas abertas por produto danificado.', em: momento(9) },
  },
  {
    id: 'VND-0205', loja: 'Sítio Verde', responsavel: 'Antônia Maria Rocha', categoria: 'Hortifrúti',
    documento: '***.317.642-**', status: 'em_verificacao', enviadoEm: momento(3), produtos: 6, vendas: 0,
    descricao: 'Hortaliças e frutas orgânicas colhidas na semana.',
  },
  {
    id: 'VND-0206', loja: 'Cerâmica da Enseada', responsavel: 'Francisco Oliveira', categoria: 'Artesanato',
    documento: '**.208.913/****-**', status: 'em_verificacao', enviadoEm: momento(1), produtos: 4, vendas: 0,
    descricao: 'Pratos, canecas e vasos de cerâmica feitos à mão.',
  },
  {
    id: 'VND-0207', loja: 'Café da Serra', responsavel: 'Beatriz Almeida', categoria: 'Alimentos',
    documento: '***.640.771-**', status: 'reprovado', enviadoEm: momento(20), produtos: 2, vendas: 0,
    descricao: 'Café torrado e moído.',
    decisao: { motivo: 'Documento ilegível. Reenvie uma foto nítida.', em: momento(17) },
  },
];

// ---- Usuários ----------------------------------------------------------------

export function listarUsuarios() {
  return simularRequisicao(() => USUARIOS);
}

export function obterUsuario(id) {
  return simularRequisicao(() => USUARIOS.find((u) => u.id === id) ?? null);
}

/** Restringir, bloquear ou reativar. Restringir e bloquear sempre levam um motivo. */
export function alterarStatusUsuario(id, { status, motivo }) {
  return simularAcao(() => {
    const usuario = USUARIOS.find((u) => u.id === id);
    usuario.status = status;
    usuario.restricao = status === 'ativo' ? null : { motivo, em: paraDataHoraISO(new Date()) };
    return usuario;
  });
}

export function alterarPapeis(id, papeis) {
  return simularAcao(() => {
    const usuario = USUARIOS.find((u) => u.id === id);
    usuario.papeis = papeis;
    return usuario;
  });
}

// ---- Vendedores --------------------------------------------------------------

export function listarVendedores() {
  return simularRequisicao(() => VENDEDORES);
}

export function obterVendedor(id) {
  return simularRequisicao(() => VENDEDORES.find((v) => v.id === id) ?? null);
}

/** Aprovar, reprovar, suspender ou reativar. Reprovar e suspender levam um motivo. */
export function decidirVendedor(id, { status, motivo }) {
  return simularAcao(() => {
    const vendedor = VENDEDORES.find((v) => v.id === id);
    vendedor.status = status;
    vendedor.decisao = motivo ? { motivo, em: paraDataHoraISO(new Date()) } : null;
    return vendedor;
  });
}

/** Quantos vendedores esperam verificação (a Visão geral pode usar para o atalho). */
export function contarVendedoresAVerificar() {
  return VENDEDORES.filter((v) => v.status === 'em_verificacao').length;
}