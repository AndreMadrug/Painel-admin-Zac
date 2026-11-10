// Filtro de período (Hoje, 7 dias, 30 dias e Personalizado) — RF-DSH-02.
// A escolha vale para o painel inteiro e fica guardada enquanto a aba estiver aberta.
import { lerEstado, salvarEstado } from '../lib/estado.js';
import { inicioDoDia, diasAPartirDeHoje, lerData, paraDataISO, formatarData } from '../lib/format.js';

const CHAVE = 'periodo';
const PADRAO = { tipo: '7d', de: '', ate: '' };
const OPCOES = [
  { tipo: 'hoje', rotulo: 'Hoje' },
  { tipo: '7d', rotulo: '7 dias' },
  { tipo: '30d', rotulo: '30 dias' },
  { tipo: 'custom', rotulo: 'Personalizado' },
];
const MAXIMO_DIAS = 366;

export function lerPeriodo() {
  return { ...PADRAO, ...lerEstado(CHAVE, PADRAO) };
}

/** Devolve { inicio, fim } (objetos Date) do período escolhido. */
export function intervaloDoPeriodo(periodo = lerPeriodo()) {
  const hoje = inicioDoDia();
  let inicio = diasAPartirDeHoje(-6);
  let fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59, 999);

  if (periodo.tipo === 'hoje') {
    inicio = hoje;
  } else if (periodo.tipo === '30d') {
    inicio = diasAPartirDeHoje(-29);
  } else if (periodo.tipo === 'custom' && periodo.de && periodo.ate) {
    inicio = lerData(periodo.de);
    const ultimo = lerData(periodo.ate);
    fim = new Date(ultimo.getFullYear(), ultimo.getMonth(), ultimo.getDate(), 23, 59, 59, 999);
  }
  return { inicio, fim };
}

export function descreverPeriodo(periodo = lerPeriodo()) {
  const { inicio, fim } = intervaloDoPeriodo(periodo);
  const mesmoDia = inicioDoDia(inicio).getTime() === inicioDoDia(fim).getTime();
  return mesmoDia ? formatarData(inicio) : `${formatarData(inicio)} a ${formatarData(fim)}`;
}

/**
 * Desenha o seletor dentro de "container".
 * "aoMudar" é chamado sempre que a pessoa escolhe um período novo.
 */
export function montarSeletorPeriodo(container, aoMudar) {
  let periodo = lerPeriodo();
  let customAberto = periodo.tipo === 'custom';

  function desenhar() {
    const hoje = paraDataISO(new Date());
    const de = periodo.de || paraDataISO(diasAPartirDeHoje(-6));
    const ate = periodo.ate || hoje;

    container.innerHTML = `
      <div class="periodo">
        <div class="periodo__botoes" role="group" aria-label="Período">
          ${OPCOES.map(
            (o) =>
              `<button class="periodo__botao" type="button" data-tipo="${o.tipo}" aria-pressed="${
                (customAberto ? 'custom' : periodo.tipo) === o.tipo
              }">${o.rotulo}</button>`
          ).join('')}
        </div>
        <form class="periodo__custom" novalidate ${customAberto ? '' : 'hidden'}>
          <label class="campo"><span>De</span><input type="date" name="de" value="${de}" max="${hoje}" /></label>
          <label class="campo"><span>Até</span><input type="date" name="ate" value="${ate}" max="${hoje}" /></label>
          <button class="btn" type="submit">Aplicar</button>
        </form>
        <p class="periodo__erro" role="alert"></p>
        <p class="nota">Período: ${descreverPeriodo(periodo)}</p>
      </div>`;
  }

  container.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-tipo]');
    if (!botao) return;
    const tipo = botao.dataset.tipo;
    if (tipo === 'custom') {
      customAberto = true;
      desenhar();
      container.querySelector('[data-tipo="custom"]').focus();
      return;
    }
    customAberto = false;
    periodo = { tipo, de: '', ate: '' };
    salvarEstado(CHAVE, periodo);
    desenhar();
    container.querySelector(`[data-tipo="${tipo}"]`).focus();
    aoMudar();
  });

  container.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const formulario = evento.target;
    const de = formulario.elements.de.value;
    const ate = formulario.elements.ate.value;
    const erro = container.querySelector('.periodo__erro');
    const hoje = paraDataISO(new Date());

    if (!de || !ate) {
      erro.textContent = 'Informe as duas datas.';
    } else if (de > ate) {
      erro.textContent = 'A data inicial não pode ser depois da final.';
    } else if (ate > hoje) {
      erro.textContent = 'A data final não pode ser no futuro.';
    } else if ((lerData(ate) - lerData(de)) / 86400000 > MAXIMO_DIAS) {
      erro.textContent = 'Escolha um período de no máximo 1 ano.';
    } else {
      periodo = { tipo: 'custom', de, ate };
      salvarEstado(CHAVE, periodo);
      desenhar();
      aoMudar();
    }
  });

  desenhar();
}
