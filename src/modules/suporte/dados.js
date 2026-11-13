// Dados de EXEMPLO do módulo Suporte (chamados).
// As alterações ficam só na memória: ao recarregar a página, voltam ao começo.
import { simularRequisicao, simularAcao } from '../../lib/api.js';
import { diasAPartirDeHoje, paraDataHoraISO } from '../../lib/format.js';

export const PRIORIDADES = {
  baixa: { rotulo: 'Baixa', variante: 'neutro', peso: 1 },
  media: { rotulo: 'Média', variante: 'azul', peso: 2 },
  alta: { rotulo: 'Alta', variante: 'coral', peso: 3 },
  urgente: { rotulo: 'Urgente', variante: 'coral', peso: 4 },
};

export const STATUS_CHAMADO = {
  aberto: { rotulo: 'Aberto', variante: 'azul' },
  em_andamento: { rotulo: 'Em andamento', variante: 'escuro' },
  aguardando: { rotulo: 'Aguardando usuário', variante: 'neutro' },
  encerrado: { rotulo: 'Encerrado', variante: 'verde' },
};

/** Status que a equipe pode escolher no select (encerrar tem botão próprio). */
export const STATUS_ESCOLHIVEIS = ['aberto', 'em_andamento', 'aguardando'];

const momento = (diasAtras, hora = 10, minuto = 0) => {
  const data = diasAPartirDeHoje(-diasAtras);
  data.setHours(hora, minuto);
  return paraDataHoraISO(data);
};
const usuario = (texto, em, nome) => ({ autor: 'usuario', nome, texto, em });
const equipe = (texto, em, nome = 'Equipe zac') => ({ autor: 'equipe', nome, texto, em });

const CHAMADOS = [
  {
    id: 'CHM-1008', usuario: { id: 'USR-1042', nome: 'Ana Beatriz Souza' },
    assunto: 'Não consigo finalizar a compra no aplicativo', prioridade: 'urgente', status: 'aberto',
    criadoEm: momento(0, 8, 15), atualizadoEm: momento(0, 8, 15),
    mensagens: [
      usuario('Bom dia! Toda vez que tento pagar com Pix o aplicativo fecha. Já tentei três vezes e preciso do produto até sexta.', momento(0, 8, 15), 'Ana Beatriz Souza'),
    ],
  },
  {
    id: 'CHM-1007', usuario: { id: 'USR-1045', nome: 'Roberto Alves' },
    assunto: 'Cobrança duplicada no cartão', prioridade: 'alta', status: 'em_andamento',
    criadoEm: momento(1, 14, 0), atualizadoEm: momento(0, 9, 30),
    mensagens: [
      usuario('Fui cobrado duas vezes pelo pedido PED-2049. Podem verificar?', momento(1, 14, 0), 'Roberto Alves'),
      equipe('Olá, Roberto! Estamos conferindo com o financeiro e retornamos ainda hoje.', momento(1, 15, 10), 'Maria Eduarda'),
      usuario('Obrigado, aguardo.', momento(1, 15, 40), 'Roberto Alves'),
      equipe('Confirmamos a duplicidade. O estorno já foi solicitado e aparece em até 5 dias úteis.', momento(0, 9, 30), 'Maria Eduarda'),
    ],
  },
  {
    id: 'CHM-1006', usuario: { id: 'USR-1044', nome: 'Juliana Ferreira' },
    assunto: 'Como altero o endereço de entrega?', prioridade: 'baixa', status: 'aguardando',
    criadoEm: momento(2, 11, 20), atualizadoEm: momento(2, 13, 0),
    mensagens: [
      usuario('Mudei de casa e quero trocar o endereço do meu cadastro.', momento(2, 11, 20), 'Juliana Ferreira'),
      equipe('Oi, Juliana! Você pode alterar em Perfil > Endereços. Qual é o seu aparelho (Android ou iPhone)?', momento(2, 13, 0), 'André'),
    ],
  },
  {
    id: 'CHM-1005', usuario: { id: 'USR-1048', nome: 'Fernanda Costa' },
    assunto: 'Vendedor não respondeu sobre o prazo', prioridade: 'media', status: 'aberto',
    criadoEm: momento(3, 16, 45), atualizadoEm: momento(3, 16, 45),
    mensagens: [
      usuario('Comprei um bolo de aniversário e o vendedor não responde minhas mensagens há 2 dias.', momento(3, 16, 45), 'Fernanda Costa'),
    ],
  },
  {
    id: 'CHM-1004', usuario: { id: 'USR-1046', nome: 'Patrícia Gomes' },
    assunto: 'Quero indicar um lugar para o mapa', prioridade: 'baixa', status: 'em_andamento',
    criadoEm: momento(5, 9, 5), atualizadoEm: momento(4, 10, 0),
    mensagens: [
      usuario('Existe uma feira de artesanato em Gaibu que não aparece no mapa. Como indico?', momento(5, 9, 5), 'Patrícia Gomes'),
      equipe('Oi, Patrícia! Você pode sugerir pelo aplicativo, em Locais > Sugerir lugar. Já pode usar!', momento(4, 10, 0), 'Maria Eduarda'),
    ],
  },
  {
    id: 'CHM-1003', usuario: { id: 'USR-1043', nome: 'Carlos Henrique Lima' },
    assunto: 'Produto chegou diferente do anúncio', prioridade: 'alta', status: 'encerrado',
    criadoEm: momento(10, 10, 0), atualizadoEm: momento(8, 17, 30),
    mensagens: [
      usuario('A cesta de palha veio menor do que na foto.', momento(10, 10, 0), 'Carlos Henrique Lima'),
      equipe('Sentimos muito, Carlos. Abrimos uma disputa (DSP-0315) para analisar o reembolso.', momento(10, 11, 30), 'André'),
      equipe('Chamado encerrado: o caso segue na disputa DSP-0315.', momento(8, 17, 30), 'André'),
    ],
  },
  {
    id: 'CHM-1002', usuario: { id: 'USR-1047', nome: 'Marcos Vinícius' },
    assunto: 'Esqueci a senha', prioridade: 'media', status: 'encerrado',
    criadoEm: momento(14, 8, 0), atualizadoEm: momento(14, 8, 40),
    mensagens: [
      usuario('Não consigo entrar na minha conta.', momento(14, 8, 0), 'Marcos Vinícius'),
      equipe('Enviamos um link de redefinição para o seu e-mail. Conseguiu acessar?', momento(14, 8, 20), 'Maria Eduarda'),
      usuario('Consegui, obrigado!', momento(14, 8, 35), 'Marcos Vinícius'),
      equipe('Chamado encerrado. Qualquer coisa, é só chamar.', momento(14, 8, 40), 'Maria Eduarda'),
    ],
  },
];

export function listarChamados() {
  return simularRequisicao(() => CHAMADOS);
}

export function obterChamado(id) {
  return simularRequisicao(() => CHAMADOS.find((c) => c.id === id) ?? null);
}

/** Quantos chamados ainda não foram encerrados (usado na Visão geral). */
export function contarChamadosAbertos() {
  return CHAMADOS.filter((c) => c.status !== 'encerrado').length;
}

/** RF-ISU-06: registrar um chamado em nome de um usuário. */
export function criarChamado({ usuario: dono, assunto, prioridade, mensagem, autor }) {
  return simularAcao(() => {
    const agora = paraDataHoraISO(new Date());
    const numero = 1000 + CHAMADOS.length + 1;
    const chamado = {
      id: `CHM-${numero}`,
      usuario: dono,
      assunto,
      prioridade,
      status: 'aberto',
      criadoEm: agora,
      atualizadoEm: agora,
      mensagens: [equipe(mensagem, agora, autor)],
    };
    CHAMADOS.push(chamado);
    return chamado;
  });
}

/** RF-ISU-05: responder na conversa. */
export function responderChamado(id, { texto, autor }) {
  return simularAcao(() => {
    const chamado = CHAMADOS.find((c) => c.id === id);
    const agora = paraDataHoraISO(new Date());
    chamado.mensagens.push(equipe(texto, agora, autor));
    chamado.atualizadoEm = agora;
    if (chamado.status === 'aberto') chamado.status = 'em_andamento';
    return chamado;
  });
}

/** RF-ISU-05: mudar o status do chamado. */
export function mudarStatusChamado(id, status) {
  return simularAcao(() => {
    const chamado = CHAMADOS.find((c) => c.id === id);
    chamado.status = status;
    chamado.atualizadoEm = paraDataHoraISO(new Date());
    return chamado;
  });
}

/** RF-ISU-05: encerrar o atendimento. */
export function encerrarChamado(id, { autor }) {
  return simularAcao(() => {
    const chamado = CHAMADOS.find((c) => c.id === id);
    const agora = paraDataHoraISO(new Date());
    chamado.status = 'encerrado';
    chamado.atualizadoEm = agora;
    chamado.mensagens.push(equipe('Chamado encerrado pela equipe.', agora, autor));
    return chamado;
  });
}
