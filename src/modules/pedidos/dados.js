// Dados de EXEMPLO do módulo Pedidos (somente consulta).
import { simularRequisicao } from '../../lib/api.js';
import { listarDisputas } from '../disputas/dados.js';
import { listarMovimentacoes } from '../financeiro/dados.js';
import { diasAPartirDeHoje, paraDataHoraISO, lerData } from '../../lib/format.js';

export const STATUS = {
  em_preparo: { rotulo: 'Em preparo', variante: 'escuro' },
  enviado: { rotulo: 'Enviado', variante: 'azul' },
  entregue: { rotulo: 'Entregue', variante: 'verde' },
  cancelado: { rotulo: 'Cancelado', variante: 'coral' },
};

const momento = (diasAtras, hora, minuto) => {
  const data = diasAPartirDeHoje(-diasAtras);
  data.setHours(hora, minuto);
  return paraDataHoraISO(data);
};
const mais = (iso, horas) => paraDataHoraISO(new Date(lerData(iso).getTime() + horas * 3600000));

// Etapas da linha do tempo: [rótulo, horas depois da criação do pedido].
const ETAPAS = [
  ['Pedido feito', 0],
  ['Pagamento confirmado', 0.2],
  ['Em preparo', 3],
  ['Enviado', 26],
  ['Entregue', 74],
];
const ETAPAS_ATE = { em_preparo: 3, enviado: 4, entregue: 5 };

function linhaDoTempo(criadoEm, status) {
  if (status === 'cancelado') {
    return [
      { rotulo: 'Pedido feito', em: criadoEm },
      { rotulo: 'Pedido cancelado', em: mais(criadoEm, 5) },
    ];
  }
  return ETAPAS.slice(0, ETAPAS_ATE[status]).map(([rotulo, horas]) => ({ rotulo, em: mais(criadoEm, horas) }));
}

const ENDERECOS = [
  { rua: 'Rua das Palmeiras, 120', bairro: 'Centro' },
  { rua: 'Av. Beira-Mar, 845', bairro: 'Gaibu' },
  { rua: 'Rua do Sol, 33', bairro: 'Santo Inácio' },
  { rua: 'Travessa das Flores, 9', bairro: 'Charneca' },
];

// [id, dias atrás, forma de pagamento, status, comprador, vendedor, [[item, qtd, preço]], frete]
const BASE = [
  ['PED-2060', 0, 'Pix', 'em_preparo', 'Ana Beatriz Souza', 'Doces da Vovó', [['Bolo de rolo', 1, 89.9], ['Caixa de brigadeiros', 1, 80]], 20],
  ['PED-2059', 0, 'Cartão de crédito', 'em_preparo', 'Carlos Henrique Lima', 'Mel do Cabo', [['Mel silvestre 500 g', 1, 66.5]], 10],
  ['PED-2058', 2, 'Cartão de crédito', 'enviado', 'Juliana Ferreira', 'Artesanato do Cabo', [['Cesta de palha', 2, 105]], 30],
  ['PED-2057', 1, 'Pix', 'em_preparo', 'Roberto Alves', 'Sítio Verde', [['Cesta de hortaliças', 1, 48]], 10],
  ['PED-2056', 3, 'Boleto', 'enviado', 'Patrícia Gomes', 'Sabores da Praia', [['Azeite artesanal', 2, 56.2]], 20],
  ['PED-2055', 5, 'Pix', 'entregue', 'Marcos Vinícius', 'Cerâmica da Enseada', [['Vaso de cerâmica', 1, 150], ['Jogo de canecas', 1, 140]], 20],
  ['PED-2054', 4, 'Cartão de crédito', 'entregue', 'Fernanda Costa', 'Doces da Vovó', [['Caixa de doces sortidos', 1, 85.9]], 10],
  ['PED-2053', 6, 'Pix', 'entregue', 'Luciana Matos', 'Mel do Cabo', [['Pote de mel', 2, 19]], 10],
  ['PED-2052', 8, 'Cartão de crédito', 'entregue', 'Eduardo Pires', 'Sítio Verde', [['Cesta orgânica', 5, 37]], 20],
  ['PED-2051', 11, 'Pix', 'cancelado', 'Sandra Barbosa', 'Artesanato do Cabo', [['Porta-copos de palha', 1, 57.8]], 10],
  ['PED-2050', 15, 'Boleto', 'entregue', 'Helena Duarte', 'Sabores da Praia', [['Geleia de caju', 2, 69]], 20],
  ['PED-2049', 19, 'Cartão de crédito', 'entregue', 'Paulo Ribeiro', 'Cerâmica da Enseada', [['Prato artesanal', 3, 130]], 30],
];

const arredondar = (n) => Math.round(n * 100) / 100;

const PEDIDOS = BASE.map(([id, dias, metodo, status, comprador, vendedor, itens, frete], i) => {
  const criadoEm = momento(dias, 9, 10 + i);
  const lista = itens.map(([nome, quantidade, preco]) => ({ nome, quantidade, preco }));
  const subtotal = arredondar(lista.reduce((soma, item) => soma + item.quantidade * item.preco, 0));
  return {
    id,
    criadoEm,
    status,
    comprador,
    vendedor,
    itens: lista,
    subtotal,
    frete,
    total: arredondar(subtotal + frete),
    pagamento: { metodo, status: status === 'cancelado' ? 'Estornado' : 'Pago' },
    endereco: { ...ENDERECOS[i % ENDERECOS.length], cidade: 'Cabo de Santo Agostinho' },
    linhaDoTempo: linhaDoTempo(criadoEm, status),
  };
});

export function listarPedidos() {
  return simularRequisicao(() => PEDIDOS);
}

export function obterPedido(id) {
  return simularRequisicao(() => PEDIDOS.find((p) => p.id === id) ?? null);
}

/** Atalhos do detalhe: a disputa e a movimentação de venda ligadas ao pedido. */
export async function obterAtalhos(idPedido) {
  const [disputas, movimentacoes] = await Promise.all([listarDisputas(), listarMovimentacoes()]);
  return {
    disputa: disputas.find((d) => d.pedido === idPedido) ?? null,
    pagamento: movimentacoes.find((m) => m.pedido === idPedido && m.tipo === 'Venda') ?? null,
  };
}