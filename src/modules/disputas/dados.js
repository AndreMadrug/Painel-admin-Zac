// Dados de EXEMPLO do módulo Disputas e reembolsos.
// As alterações ficam só na memória: ao recarregar a página, voltam ao começo.
import { simularRequisicao, simularAcao } from '../../lib/api.js';
import { diasAPartirDeHoje, paraDataISO, paraDataHoraISO } from '../../lib/format.js';

/** status (RF-DSP-01): aberta, em_analise, reembolso, negada */
export const STATUS = {
  aberta: { rotulo: 'Aberta', variante: 'azul' },
  em_analise: { rotulo: 'Em análise', variante: 'escuro' },
  reembolso: { rotulo: 'Reembolso', variante: 'verde' },
  negada: { rotulo: 'Negada', variante: 'coral' },
};

const dia = (n) => paraDataISO(diasAPartirDeHoje(n));
const momento = (diasAtras, hora = 10, minuto = 0) => {
  const data = diasAPartirDeHoje(-diasAtras);
  data.setHours(hora, minuto);
  return paraDataHoraISO(data);
};

const DISPUTAS = [
  {
    id: 'DSP-0312',
    pedido: 'PED-2058',
    motivo: 'Produto não chegou',
    descricao: 'O pedido foi pago, mas o comprador diz que passaram 10 dias e nada foi entregue.',
    status: 'aberta',
    abertaEm: momento(5),
    prazo: dia(-1),
    comprador: 'Ana Beatriz Souza',
    vendedor: 'Doces da Vovó',
    valorPedido: 132.4,
    pagamento: { metodo: 'Pix', status: 'Pago' },
    evidencias: [
      { nome: 'print-conversa.png', tipo: 'imagem' },
      { nome: 'comprovante-pix.pdf', tipo: 'arquivo' },
    ],
  },
  {
    id: 'DSP-0315',
    pedido: 'PED-2055',
    motivo: 'Produto diferente do anunciado',
    descricao: 'A cesta de palha chegou menor e com cor diferente da foto do anúncio.',
    status: 'aberta',
    abertaEm: momento(3),
    prazo: dia(1),
    comprador: 'Carlos Henrique Lima',
    vendedor: 'Artesanato do Cabo',
    valorPedido: 240.0,
    pagamento: { metodo: 'Cartão de crédito', status: 'Pago' },
    evidencias: [
      { nome: 'foto-produto-recebido.jpg', tipo: 'imagem' },
      { nome: 'foto-anuncio.jpg', tipo: 'imagem' },
    ],
  },
  {
    id: 'DSP-0318',
    pedido: 'PED-2052',
    motivo: 'Produto danificado',
    descricao: 'A garrafa de azeite chegou quebrada e vazando na embalagem.',
    status: 'em_analise',
    abertaEm: momento(4),
    prazo: dia(0),
    comprador: 'Juliana Ferreira',
    vendedor: 'Sabores da Praia',
    valorPedido: 95.9,
    pagamento: { metodo: 'Cartão de crédito', status: 'Pago' },
    evidencias: [{ nome: 'garrafa-quebrada.jpg', tipo: 'imagem' }],
  },
  {
    id: 'DSP-0321',
    pedido: 'PED-2049',
    motivo: 'Cobrança em duplicidade',
    descricao: 'O comprador afirma ter sido cobrado duas vezes pelo mesmo pedido.',
    status: 'aberta',
    abertaEm: momento(2),
    prazo: dia(3),
    comprador: 'Roberto Alves',
    vendedor: 'Sítio Verde',
    valorPedido: 67.8,
    pagamento: { metodo: 'Pix', status: 'Pago (2 cobranças)' },
    evidencias: [{ nome: 'extrato-banco.pdf', tipo: 'arquivo' }],
  },
  {
    id: 'DSP-0324',
    pedido: 'PED-2046',
    motivo: 'Atraso na entrega',
    descricao: 'Entrega combinada para 5 dias e já se passaram 12.',
    status: 'em_analise',
    abertaEm: momento(6),
    prazo: dia(6),
    comprador: 'Patrícia Gomes',
    vendedor: 'Mel do Cabo',
    valorPedido: 158.0,
    pagamento: { metodo: 'Boleto', status: 'Pago' },
    evidencias: [{ nome: 'rastreio.png', tipo: 'imagem' }],
  },
  {
    id: 'DSP-0327',
    pedido: 'PED-2043',
    motivo: 'Arrependimento da compra',
    descricao: 'O comprador pede o dinheiro de volta porque desistiu do produto.',
    status: 'aberta',
    abertaEm: momento(1),
    prazo: dia(9),
    comprador: 'Marcos Vinícius',
    vendedor: 'Doces da Vovó',
    valorPedido: 89.0,
    pagamento: { metodo: 'Pix', status: 'Pago' },
    evidencias: [],
  },
  {
    id: 'DSP-0298',
    pedido: 'PED-2040',
    motivo: 'Produto não chegou',
    descricao: 'Comprador não recebeu o pedido. O rastreio confirmou extravio.',
    status: 'reembolso',
    abertaEm: momento(14),
    prazo: dia(-5),
    comprador: 'Fernanda Costa',
    vendedor: 'Artesanato do Cabo',
    valorPedido: 176.5,
    pagamento: { metodo: 'Pix', status: 'Pago' },
    evidencias: [{ nome: 'rastreio-extraviado.pdf', tipo: 'arquivo' }],
    decisao: { tipo: 'aprovada', justificativa: 'Extravio confirmado pela transportadora.', em: momento(8) },
    reembolso: { tipo: 'Total', valor: 176.5, status: 'Processado' },
  },
  {
    id: 'DSP-0301',
    pedido: 'PED-2037',
    motivo: 'Produto danificado',
    descricao: 'Peça de cerâmica chegou trincada. Vendedor aceitou devolver parte do valor.',
    status: 'reembolso',
    abertaEm: momento(12),
    prazo: dia(-3),
    comprador: 'Luciana Matos',
    vendedor: 'Cerâmica da Enseada',
    valorPedido: 120.0,
    pagamento: { metodo: 'Cartão de crédito', status: 'Pago' },
    evidencias: [{ nome: 'ceramica-trincada.jpg', tipo: 'imagem' }],
    decisao: { tipo: 'aprovada', justificativa: 'Dano comprovado pelas fotos.', em: momento(7) },
    reembolso: { tipo: 'Parcial', valor: 60.0, status: 'Processado' },
  },
  {
    id: 'DSP-0290',
    pedido: 'PED-2031',
    motivo: 'Produto diferente do anunciado',
    descricao: 'Comprador alega que o produto era de outra marca.',
    status: 'negada',
    abertaEm: momento(20),
    prazo: dia(-10),
    comprador: 'Eduardo Pires',
    vendedor: 'Sabores da Praia',
    valorPedido: 54.0,
    pagamento: { metodo: 'Pix', status: 'Pago' },
    evidencias: [{ nome: 'foto-rotulo.jpg', tipo: 'imagem' }],
    decisao: { tipo: 'negada', justificativa: 'O rótulo recebido é igual ao do anúncio.', em: momento(15) },
  },
  {
    id: 'DSP-0285',
    pedido: 'PED-2028',
    motivo: 'Arrependimento da compra',
    descricao: 'Pedido de devolução feito depois do prazo de 7 dias.',
    status: 'negada',
    abertaEm: momento(25),
    prazo: dia(-16),
    comprador: 'Sandra Barbosa',
    vendedor: 'Mel do Cabo',
    valorPedido: 72.0,
    pagamento: { metodo: 'Boleto', status: 'Pago' },
    evidencias: [],
    decisao: { tipo: 'negada', justificativa: 'Pedido fora do prazo de arrependimento.', em: momento(20) },
  },
];

export function listarDisputas() {
  return simularRequisicao(() => DISPUTAS);
}

export function obterDisputa(id) {
  return simularRequisicao(() => DISPUTAS.find((d) => d.id === id) ?? null);
}

/** Quantas disputas ainda precisam de decisão (usado na Visão geral). */
export function contarPendentes() {
  return DISPUTAS.filter((d) => d.status === 'aberta' || d.status === 'em_analise').length;
}

/** RF-DSP-04: aprovar ou negar, sempre com justificativa. */
export function decidirDisputa(id, { aprovar, justificativa }) {
  return simularAcao(() => {
    const disputa = DISPUTAS.find((d) => d.id === id);
    disputa.status = aprovar ? 'reembolso' : 'negada';
    disputa.decisao = {
      tipo: aprovar ? 'aprovada' : 'negada',
      justificativa,
      em: paraDataHoraISO(new Date()),
    };
    return disputa;
  });
}

/** RF-DSP-05: reembolso total ou parcial, com o valor e o status à vista. */
export function registrarReembolso(id, { tipo, valor }) {
  return simularAcao(() => {
    const disputa = DISPUTAS.find((d) => d.id === id);
    disputa.reembolso = { tipo, valor, status: 'Processado' };
    return disputa;
  });
}
