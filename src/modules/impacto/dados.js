// Dados de EXEMPLO do módulo Impacto ISAC: ações apoiadas, indicadores e doações do checkout.
// As alterações ficam só na memória: ao recarregar a página, voltam ao começo.
import { simularRequisicao, simularAcao } from '../../lib/api.js';
import { diasAPartirDeHoje, paraDataHoraISO } from '../../lib/format.js';

export const STATUS_ACAO = {
  ativa: { rotulo: 'Ativa', variante: 'verde' },
  encerrada: { rotulo: 'Encerrada', variante: 'neutro' },
};

const dia = (diasAtras) => {
  const data = diasAPartirDeHoje(-diasAtras);
  data.setHours(10, 0);
  return paraDataHoraISO(data);
};

// "arrecadadoAnterior" é o que a ação já tinha antes das doações listadas abaixo.
const ACOES = [
  {
    id: 'ACA-01', nome: 'Replantio de mata nativa',
    descricao: 'Plantio de mudas nativas em áreas de restinga degradadas do Cabo de Santo Agostinho.',
    meta: 15000, arrecadadoAnterior: 6200, status: 'ativa', criadaEm: dia(150),
    indicador: { rotulo: 'mudas plantadas', valor: 1240 },
  },
  {
    id: 'ACA-02', nome: 'Limpeza das praias',
    descricao: 'Mutirões mensais de limpeza nas praias de Gaibu, Calhetas e Paiva.',
    meta: 8000, arrecadadoAnterior: 3100, status: 'ativa', criadaEm: dia(120),
    indicador: { rotulo: 'kg de lixo retirados', valor: 3850 },
  },
  {
    id: 'ACA-03', nome: 'Oficinas de educação ambiental',
    descricao: 'Oficinas gratuitas sobre meio ambiente e cidadania para jovens das escolas públicas.',
    meta: 5000, arrecadadoAnterior: 1800, status: 'ativa', criadaEm: dia(90),
    indicador: { rotulo: 'jovens atendidos', valor: 214 },
  },
  {
    id: 'ACA-04', nome: 'Campanha de coleta de óleo',
    descricao: 'Pontos de coleta de óleo de cozinha usado para reciclagem.',
    meta: 3000, arrecadadoAnterior: 3000, status: 'encerrada', criadaEm: dia(300),
    indicador: { rotulo: 'litros coletados', valor: 960 },
  },
];

// [dias atrás, valor, ação, pedido]
const DOACOES_BASE = [
  [0, 3.8, 'ACA-01', 'PED-2060'], [0, 1.53, 'ACA-02', 'PED-2059'], [1, 4.8, 'ACA-01', 'PED-2058'],
  [1, 1.16, 'ACA-03', 'PED-2057'], [2, 2.65, 'ACA-02', 'PED-2056'], [3, 6.2, 'ACA-01', 'PED-2055'],
  [3, 1.92, 'ACA-03', 'PED-2054'], [4, 1.9, 'ACA-02', 'PED-2053'], [6, 0.96, 'ACA-01', 'PED-2052'],
  [8, 4.1, 'ACA-03', 'PED-2051'], [9, 2.4, 'ACA-02', 'PED-2050'], [11, 1.36, 'ACA-01', 'PED-2049'],
  [14, 3.16, 'ACA-02', 'PED-2048'], [16, 8.4, 'ACA-01', 'PED-2047'], [19, 1.78, 'ACA-03', 'PED-2046'],
  [22, 5.1, 'ACA-02', 'PED-2045'], [25, 1.2, 'ACA-01', 'PED-2044'], [28, 3.53, 'ACA-03', 'PED-2043'],
  [31, 2.0, 'ACA-01', 'PED-2042'], [35, 4.4, 'ACA-02', 'PED-2041'], [40, 1.26, 'ACA-01', 'PED-2040'],
  [44, 3.0, 'ACA-03', 'PED-2039'],
];
const DOACOES = DOACOES_BASE.map(([dias, valor, acao, pedido], i) => ({
  id: `DOA-${900 + i}`,
  data: dia(dias),
  valor,
  acaoId: acao,
  pedido,
}));

const arredondar = (n) => Math.round(n * 100) / 100;

/** Soma do que a ação já arrecadou (valor anterior + doações do checkout). */
function arrecadadoDa(acao) {
  const doacoes = DOACOES.filter((d) => d.acaoId === acao.id).reduce((soma, d) => soma + d.valor, 0);
  return arredondar(acao.arrecadadoAnterior + doacoes);
}

export function listarAcoes() {
  return simularRequisicao(() => ACOES.map((a) => ({ ...a, arrecadado: arrecadadoDa(a) })));
}

export function listarDoacoes() {
  return simularRequisicao(() =>
    DOACOES.map((d) => ({ ...d, acaoNome: ACOES.find((a) => a.id === d.acaoId)?.nome ?? d.acaoId }))
  );
}

/** RF-ISU-01: cadastrar ação. */
export function criarAcao({ nome, descricao, meta, indicadorRotulo, indicadorValor }) {
  return simularAcao(() => {
    const numero = ACOES.length + 1;
    const acao = {
      id: `ACA-${String(numero).padStart(2, '0')}`,
      nome,
      descricao,
      meta,
      arrecadadoAnterior: 0,
      status: 'ativa',
      criadaEm: paraDataHoraISO(new Date()),
      indicador: { rotulo: indicadorRotulo, valor: indicadorValor },
    };
    ACOES.push(acao);
    return acao;
  });
}

/** RF-ISU-01: editar ação. */
export function editarAcao(id, { nome, descricao, meta, indicadorRotulo, indicadorValor }) {
  return simularAcao(() => {
    const acao = ACOES.find((a) => a.id === id);
    Object.assign(acao, { nome, descricao, meta, indicador: { rotulo: indicadorRotulo, valor: indicadorValor } });
    return acao;
  });
}

/** RF-ISU-01: encerrar ação. */
export function encerrarAcao(id) {
  return simularAcao(() => {
    const acao = ACOES.find((a) => a.id === id);
    acao.status = 'encerrada';
    return acao;
  });
}
