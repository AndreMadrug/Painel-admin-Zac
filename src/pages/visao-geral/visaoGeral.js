// Tela 2 — Visão geral (RF-DSH-01 a RF-DSH-04).
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { montarSeletorPeriodo, intervaloDoPeriodo } from '../../components/periodo.js';
import { htmlCarregando, htmlErro } from '../../components/estados.js';
import { obterResumo } from '../../modules/painel/dados.js';
import { formatarMoeda, formatarNumero, esc } from '../../lib/format.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const COR_VENDAS = '#1f8196';
const COR_PEDIDOS = '#17a673';

function cartao(rotulo, valor, nota, variante = '') {
  return `<div class="cartao-resumo ${variante}">
    <div class="cartao-resumo__rotulo">${esc(rotulo)}</div>
    <div class="cartao-resumo__valor">${esc(valor)}</div>
    <div class="cartao-resumo__nota">${esc(nota)}</div>
  </div>`;
}

function htmlConteudo(r) {
  const pendencias = r.pendencias
    .map(
      (p) => `<li>
        <a class="pendencia" href="${p.rota}">
          <span>${esc(p.rotulo)}</span>
          <span class="pendencia__contador" aria-label="${p.quantidade} pendentes">${p.quantidade}</span>
        </a>
      </li>`
    )
    .join('');

  return `
    <div class="grade-cartoes">
      ${cartao('Usuários', formatarNumero(r.novosUsuarios), `novos no período · ${formatarNumero(r.usuariosTotal)} no total`)}
      ${cartao('Vendas', formatarMoeda(r.vendas), 'volume bruto no período', 'cartao-resumo--verde')}
      ${cartao('Pedidos', formatarNumero(r.pedidos), 'pedidos feitos no período', 'cartao-resumo--escuro')}
      ${cartao('Indicadores', formatarMoeda(r.doacoes), 'doações ao ISAC no período', 'cartao-resumo--coral')}
    </div>

    <section class="cartao" aria-labelledby="titulo-grafico">
      <h2 id="titulo-grafico">Vendas e pedidos no período</h2>
      <div class="grafico">
        <canvas role="img" aria-label="Gráfico de linhas com as vendas em reais e a quantidade de pedidos por dia no período. Total de ${formatarMoeda(
          r.vendas
        )} em vendas e ${r.pedidos} pedidos."></canvas>
      </div>
    </section>

    <section class="pendencias" aria-labelledby="titulo-pendencias">
      <h2 id="titulo-pendencias">Pendências</h2>
      <ul>${pendencias}</ul>
    </section>`;
}

function desenharGrafico(canvas, dias) {
  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  Chart.defaults.color = '#4b6b73';
  return new Chart(canvas, {
    type: 'line',
    data: {
      labels: dias.map((d) => d.rotulo),
      datasets: [
        {
          label: 'Vendas (R$)',
          data: dias.map((d) => d.vendas),
          borderColor: COR_VENDAS,
          backgroundColor: COR_VENDAS,
          yAxisID: 'vendas',
          tension: 0.25,
          pointRadius: dias.length > 35 ? 0 : 3,
        },
        {
          label: 'Pedidos',
          data: dias.map((d) => d.pedidos),
          borderColor: COR_PEDIDOS,
          backgroundColor: COR_PEDIDOS,
          yAxisID: 'pedidos',
          tension: 0.25,
          pointRadius: dias.length > 35 ? 0 : 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: (item) =>
              item.dataset.yAxisID === 'vendas'
                ? ` Vendas: ${formatarMoeda(item.parsed.y)}`
                : ` Pedidos: ${item.parsed.y}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 12 } },
        vendas: {
          position: 'left',
          beginAtZero: true,
          ticks: { callback: (v) => formatarMoeda(v) },
          title: { display: true, text: 'Vendas' },
        },
        pedidos: {
          position: 'right',
          beginAtZero: true,
          grid: { drawOnChartArea: false },
          ticks: { precision: 0 },
          title: { display: true, text: 'Pedidos' },
        },
      },
    },
  });
}

export function paginaVisaoGeral({ container }) {
  container.innerHTML = `
    <div class="pagina__topo">
      <div>
        <h1>Visão geral</h1>
        <p class="pagina__subtitulo">Resumo da operação e atalhos para o que precisa de ação.</p>
      </div>
      <div data-periodo></div>
    </div>
    <div data-conteudo class="pagina" style="padding:0"></div>`;

  const area = container.querySelector('[data-conteudo]');
  let grafico = null;
  let ativo = true;
  let numeroDaBusca = 0;

  async function carregar() {
    const minhaBusca = ++numeroDaBusca;
    grafico?.destroy();
    grafico = null;
    area.innerHTML = htmlCarregando(8);

    let resumo;
    try {
      const { inicio, fim } = intervaloDoPeriodo();
      resumo = await obterResumo(inicio, fim);
    } catch {
      if (ativo && minhaBusca === numeroDaBusca) area.innerHTML = htmlErro();
      return;
    }
    if (!ativo || minhaBusca !== numeroDaBusca) return;

    area.innerHTML = htmlConteudo(resumo);
    grafico = desenharGrafico(area.querySelector('canvas'), resumo.dias);
  }

  area.addEventListener('click', (evento) => {
    if (evento.target.closest('[data-acao="tentar-novo"]')) carregar();
  });

  montarSeletorPeriodo(container.querySelector('[data-periodo]'), carregar);
  carregar();

  return () => {
    ativo = false;
    grafico?.destroy();
  };
}
