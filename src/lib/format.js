// Funções de formatação usadas em todas as telas.
// Datas no formato brasileiro e valores em reais (RI-07).

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const formatoData = new Intl.DateTimeFormat('pt-BR');
const formatoDataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export const formatarMoeda = (valor) => formatoMoeda.format(valor);
export const formatarNumero = (valor) => new Intl.NumberFormat('pt-BR').format(valor);

/** Converte "2026-11-09" ou "2026-11-09T14:30" em Date no horário local. */
export function lerData(texto) {
  if (texto instanceof Date) return texto;
  const [parteData, parteHora = '00:00'] = texto.split('T');
  const [ano, mes, dia] = parteData.split('-').map(Number);
  const [hora, minuto] = parteHora.split(':').map(Number);
  return new Date(ano, mes - 1, dia, hora, minuto);
}

export const formatarData = (texto) => formatoData.format(lerData(texto));
export const formatarDataHora = (texto) => formatoDataHora.format(lerData(texto)).replace(',', ' às');

/** Date -> "2026-11-09" (data local). */
export function paraDataISO(data) {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

/** Date -> "2026-11-09T14:30" (data e hora local). */
export function paraDataHoraISO(data) {
  const hora = String(data.getHours()).padStart(2, '0');
  const minuto = String(data.getMinutes()).padStart(2, '0');
  return `${paraDataISO(data)}T${hora}:${minuto}`;
}

export function inicioDoDia(data = new Date()) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

/** Data daqui a N dias (N negativo = no passado), como Date à meia-noite. */
export function diasAPartirDeHoje(n) {
  const data = inicioDoDia();
  data.setDate(data.getDate() + n);
  return data;
}

/** Quantos dias faltam até a data (negativo = já passou). */
export function diasAte(texto) {
  const alvo = inicioDoDia(lerData(texto));
  return Math.round((alvo - inicioDoDia()) / 86400000);
}

/** Protege o HTML: use sempre que colocar texto de dados dentro de innerHTML. */
export function esc(texto) {
  return String(texto ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Normaliza texto para buscas sem se importar com acentos e maiúsculas. */
export function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}
