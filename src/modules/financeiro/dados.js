// Dados de EXEMPLO do módulo Financeiro. Com o back-end, estas funções passam a chamar a API.
import { simularRequisicao } from '../../lib/api.js';
import { diasAPartirDeHoje, paraDataHoraISO, lerData } from '../../lib/format.js';

export const TIPOS = ['Venda', 'Taxa', 'Repasse', 'Doação ao ISAC', 'Reembolso'];

// [valor do pedido, dias atrás, forma de pagamento]
const PEDIDOS = [
  [189.9, 0, 'Pix'],
  [76.5, 0, 'Cartão de crédito'],
  [240.0, 1, 'Cartão de crédito'],
  [58.0, 1, 'Pix'],
  [132.4, 2, 'Boleto'],
  [310.0, 3, 'Pix'],
  [95.9, 4, 'Cartão de crédito'],
  [48.0, 6, 'Pix'],
  [205.0, 8, 'Cartão de crédito'],
  [67.8, 11, 'Pix'],
  [158.0, 15, 'Boleto'],
  [420.0, 19, 'Cartão de crédito'],
  [89.0, 24, 'Pix'],
  [176.5, 28, 'Pix'],
  [63.0, 33, 'Cartão de crédito'],
  [250.0, 41, 'Pix'],
];
const REEMBOLSOS = { 3: 58.0, 9: 30.0, 13: 176.5 }; // posição do pedido -> valor devolvido

const arredondar = (n) => Math.round(n * 100) / 100;

function momento(diasAtras, hora, minuto) {
  const data = diasAPartirDeHoje(-diasAtras);
  data.setHours(hora, minuto);
  return paraDataHoraISO(data);
}

function gerarMovimentacoes() {
  const lista = [];
  let numero = 1000;
  const nova = (dados) => lista.push({ id: `MOV-${numero++}`, ...dados });

  PEDIDOS.forEach(([valor, dias, metodo], i) => {
    const pedido = `PED-${2060 - i}`;
    const taxa = arredondar(valor * 0.05);
    const doacao = arredondar(valor * 0.02);
    const repasse = arredondar(valor - taxa - doacao);
    const recente = dias <= 1;

    nova({ tipo: 'Venda', valor, pedido, metodo, status: 'Concluída', data: momento(dias, 9, 10 + i) });
    nova({ tipo: 'Taxa', valor: taxa, pedido, metodo, status: 'Concluída', data: momento(dias, 9, 11 + i) });
    nova({ tipo: 'Doação ao ISAC', valor: doacao, pedido, metodo, status: 'Concluída', data: momento(dias, 9, 12 + i) });
    nova({
      tipo: 'Repasse',
      valor: repasse,
      pedido,
      metodo,
      status: recente ? 'Pendente' : i === 7 ? 'Falhou' : 'Concluída',
      data: momento(Math.max(dias - 1, 0), 15, 20 + i),
    });
    if (REEMBOLSOS[i]) {
      nova({
        tipo: 'Reembolso',
        valor: REEMBOLSOS[i],
        pedido,
        metodo,
        status: 'Concluída',
        data: momento(Math.max(dias - 2, 0), 11, 5 + i),
      });
    }
  });
  return lista;
}

const MOVIMENTACOES = gerarMovimentacoes();

export function listarMovimentacoes() {
  return simularRequisicao(() => MOVIMENTACOES);
}

export function obterMovimentacao(id) {
  return simularRequisicao(() => MOVIMENTACOES.find((m) => m.id === id) ?? null);
}

/** Resumo do período (RF-FIN-01). Movimentações que falharam não entram na soma. */
export function resumirPeriodo(movimentacoes, inicio, fim) {
  const resumo = { bruto: 0, taxas: 0, repasses: 0, doacoes: 0, reembolsos: 0 };
  for (const m of movimentacoes) {
    const data = lerData(m.data);
    if (m.status === 'Falhou' || data < inicio || data > fim) continue;
    if (m.tipo === 'Venda') resumo.bruto += m.valor;
    if (m.tipo === 'Taxa') resumo.taxas += m.valor;
    if (m.tipo === 'Repasse') resumo.repasses += m.valor;
    if (m.tipo === 'Doação ao ISAC') resumo.doacoes += m.valor;
    if (m.tipo === 'Reembolso') resumo.reembolsos += m.valor;
  }
  return resumo;
}

export const STATUS_MOVIMENTACAO = {
  Concluída: 'verde',
  Pendente: 'escuro',
  Falhou: 'coral',
};
