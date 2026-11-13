// Dados de EXEMPLO do módulo Sistema: configurações da plataforma e histórico de auditoria.
// As alterações ficam só na memória: ao recarregar a página, voltam ao começo.
import { simularRequisicao, simularAcao } from '../../lib/api.js';
import { diasAPartirDeHoje, paraDataHoraISO } from '../../lib/format.js';

/**
 * Configurações em formato "chave e valor" (RF-SIS-01).
 * tipo: 'numero' (com min, max e unidade), 'texto', 'email' ou 'opcao' (com opcoes).
 */
const CONFIGURACOES = [
  { chave: 'taxa_plataforma', rotulo: 'Taxa da plataforma', descricao: 'Percentual cobrado sobre cada venda.', tipo: 'numero', unidade: '%', min: 0, max: 30, valor: '5' },
  { chave: 'percentual_doacao', rotulo: 'Doação ao ISAC', descricao: 'Percentual de cada venda destinado às ações apoiadas.', tipo: 'numero', unidade: '%', min: 0, max: 20, valor: '2' },
  { chave: 'prazo_disputa', rotulo: 'Prazo para abrir disputa', descricao: 'Dias depois da entrega em que o comprador pode abrir uma disputa.', tipo: 'numero', unidade: 'dias', min: 1, max: 30, valor: '7' },
  { chave: 'prazo_repasse', rotulo: 'Prazo de repasse ao vendedor', descricao: 'Dias depois da entrega até o repasse ser feito.', tipo: 'numero', unidade: 'dias', min: 1, max: 60, valor: '14' },
  { chave: 'email_suporte', rotulo: 'E-mail de suporte', descricao: 'Endereço mostrado aos usuários para pedir ajuda.', tipo: 'email', valor: 'suporte@zac.com.br' },
  { chave: 'mensagem_manutencao', rotulo: 'Aviso do aplicativo', descricao: 'Mensagem exibida no topo do aplicativo. Deixe em branco para não mostrar.', tipo: 'texto', max: 140, valor: '' },
  { chave: 'modo_manutencao', rotulo: 'Modo de manutenção', descricao: 'Quando ligado, o aplicativo avisa que está em manutenção.', tipo: 'opcao', opcoes: ['Desligado', 'Ligado'], valor: 'Desligado' },
];

const momento = (diasAtras, hora, minuto) => {
  const data = diasAPartirDeHoje(-diasAtras);
  data.setHours(hora, minuto);
  return paraDataHoraISO(data);
};

export const MODULOS_AUDITORIA = ['Disputas', 'Usuários', 'Produtos', 'Locais', 'Suporte', 'Sistema', 'Financeiro'];

// Histórico de EXEMPLO. Em produção, o back-end é quem grava estes registros (Parte 2).
const AUDITORIA = [
  { quando: momento(0, 9, 31), ator: 'Maria Eduarda', modulo: 'Suporte', acao: 'Respondeu o chamado', alvo: 'CHM-1007', detalhe: 'Confirmou a cobrança duplicada.' },
  { quando: momento(0, 8, 50), ator: 'André', modulo: 'Disputas', acao: 'Aprovou a disputa', alvo: 'DSP-0312', detalhe: 'Justificativa: prazo de entrega estourado.' },
  { quando: momento(1, 17, 5), ator: 'André', modulo: 'Usuários', acao: 'Restringiu o usuário', alvo: 'USR-1050', detalhe: 'Motivo: várias denúncias de golpe.' },
  { quando: momento(1, 15, 12), ator: 'Maria Eduarda', modulo: 'Locais', acao: 'Aprovou a sugestão de local', alvo: 'LOC-2090', detalhe: 'Dados conferidos e local existente.' },
  { quando: momento(2, 11, 0), ator: 'Maria Eduarda', modulo: 'Produtos', acao: 'Ocultou o produto', alvo: 'PRD-3011', detalhe: 'Motivo: descrição enganosa.' },
  { quando: momento(3, 10, 20), ator: 'André', modulo: 'Sistema', acao: 'Alterou a configuração', alvo: 'prazo_disputa', detalhe: 'De 10 para 7 dias.' },
  { quando: momento(4, 16, 40), ator: 'Maria Eduarda', modulo: 'Financeiro', acao: 'Consultou a movimentação', alvo: 'MOV-1015', detalhe: 'Somente leitura.' },
  { quando: momento(5, 9, 15), ator: 'André', modulo: 'Disputas', acao: 'Negou a disputa', alvo: 'DSP-0290', detalhe: 'Justificativa: o rótulo recebido é igual ao do anúncio.' },
  { quando: momento(6, 14, 0), ator: 'Maria Eduarda', modulo: 'Usuários', acao: 'Aprovou o vendedor', alvo: 'VND-2008', detalhe: 'Documentos conferidos.' },
  { quando: momento(8, 17, 30), ator: 'André', modulo: 'Suporte', acao: 'Encerrou o chamado', alvo: 'CHM-1003', detalhe: 'Caso segue na disputa DSP-0315.' },
  { quando: momento(10, 11, 45), ator: 'Maria Eduarda', modulo: 'Locais', acao: 'Rejeitou a edição de local', alvo: 'LOC-2275', detalhe: 'A mudança de nome parece propaganda.' },
  { quando: momento(12, 9, 0), ator: 'André', modulo: 'Sistema', acao: 'Alterou a configuração', alvo: 'taxa_plataforma', detalhe: 'De 6 para 5 %.' },
  { quando: momento(15, 13, 25), ator: 'Maria Eduarda', modulo: 'Disputas', acao: 'Reembolsou (total)', alvo: 'DSP-0298', detalhe: 'Valor: R$ 176,50.' },
  { quando: momento(18, 10, 10), ator: 'André', modulo: 'Produtos', acao: 'Removeu o conteúdo denunciado', alvo: 'DEN-4002', detalhe: 'Denúncia encerrada.' },
  { quando: momento(24, 15, 50), ator: 'Maria Eduarda', modulo: 'Usuários', acao: 'Alterou os papéis', alvo: 'USR-1049', detalhe: 'Adicionou o papel Moderador.' },
  { quando: momento(31, 9, 40), ator: 'André', modulo: 'Locais', acao: 'Aprovou a reivindicação', alvo: 'LOC-2185', detalhe: 'Documento confere com o cadastro.' },
  { quando: momento(38, 16, 5), ator: 'Maria Eduarda', modulo: 'Sistema', acao: 'Alterou a configuração', alvo: 'prazo_repasse', detalhe: 'De 21 para 14 dias.' },
].map((registro, i) => ({ id: `AUD-${7000 + i}`, ...registro }));

export function listarConfiguracoes() {
  return simularRequisicao(() => CONFIGURACOES.map((c) => ({ ...c })));
}

/** RF-SIS-01: salva as configurações alteradas (mudancas = { chave: novoValor }). */
export function salvarConfiguracoes(mudancas, { autor }) {
  return simularAcao(() => {
    for (const [chave, valor] of Object.entries(mudancas)) {
      const configuracao = CONFIGURACOES.find((c) => c.chave === chave);
      const anterior = configuracao.valor;
      configuracao.valor = valor;
      // Só para a demonstração: guarda um registro no histórico desta sessão.
      AUDITORIA.unshift({
        id: `AUD-${7000 + AUDITORIA.length}`,
        quando: paraDataHoraISO(new Date()),
        ator: autor,
        modulo: 'Sistema',
        acao: 'Alterou a configuração',
        alvo: chave,
        detalhe: `De "${anterior || 'vazio'}" para "${valor || 'vazio'}".`,
      });
    }
  });
}

/** RF-SIS-02: histórico somente para consulta. */
export function listarAuditoria() {
  return simularRequisicao(() => AUDITORIA);
}
