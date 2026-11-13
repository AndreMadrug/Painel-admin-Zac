// Tela 14 — Análise do local: dados atuais x propostos, mapa e decisão com motivo (RF-LOC-02 e RF-LOC-03).
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { selo } from '../../components/selo.js';
import { htmlCarregando, htmlErro } from '../../components/estados.js';
import { confirmarAcao } from '../../components/confirmacao.js';
import { mostrarAviso } from '../../components/aviso.js';
import { obterLocal, decidirLocal, STATUS_LOCAL, ROTULO_TIPO } from '../../modules/locais/dados.js';
import { formatarDataHora, esc } from '../../lib/format.js';

const mesmoPonto = (a, b) => a && b && a.lat === b.lat && a.lng === b.lng;

export function paginaLocalDetalhe({ container, params }) {
  container.innerHTML = `
    <a class="voltar" href="#/locais">← Voltar para Locais</a>
    <div data-conteudo class="pagina" style="padding:0"></div>`;
  const area = container.querySelector('[data-conteudo]');
  let local = null;
  let mapa = null;
  let ativo = true;

  function removerMapa() {
    if (mapa) {
      mapa.remove();
      mapa = null;
    }
  }

  function desenharMapa() {
    const alvo = area.querySelector('[data-mapa]');
    if (!alvo) return;
    mapa = L.map(alvo, { scrollWheelZoom: false });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(mapa);

    const { atual, proposto } = local.coord;
    const pontos = [];
    if (atual) {
      L.circleMarker([atual.lat, atual.lng], { radius: 9, color: '#4b6b73', fillColor: '#9fb3b8', fillOpacity: 0.9, weight: 3 })
        .addTo(mapa)
        .bindTooltip('Posição atual');
      pontos.push([atual.lat, atual.lng]);
    }
    if (proposto && !mesmoPonto(atual, proposto)) {
      L.circleMarker([proposto.lat, proposto.lng], { radius: 9, color: '#0e8559', fillColor: '#17a673', fillOpacity: 0.9, weight: 3 })
        .addTo(mapa)
        .bindTooltip('Posição proposta');
      pontos.push([proposto.lat, proposto.lng]);
    }
    if (pontos.length === 1) mapa.setView(pontos[0], 15);
    else mapa.fitBounds(pontos, { padding: [40, 40], maxZoom: 16 });
  }

  function htmlComparacao() {
    const linhas = local.campos
      .map((c) => {
        const mudou = c.atual !== c.proposto;
        return `<tr>
          <th scope="row">${esc(c.rotulo)}</th>
          <td>${c.atual === null ? '<span class="nota">— (novo)</span>' : esc(c.atual)}</td>
          <td class="${mudou ? 'comparacao__mudou' : ''}">${esc(c.proposto)}${
            mudou && c.atual !== null ? `<div>${selo('Alterado', 'escuro')}</div>` : ''
          }</td>
        </tr>`;
      })
      .join('');
    return `<div class="tabela-rolagem"><table class="tabela comparacao">
      <thead><tr><th scope="col"><span>Campo</span></th><th scope="col"><span>Dados atuais</span></th><th scope="col"><span>Dados propostos</span></th></tr></thead>
      <tbody>${linhas}</tbody></table></div>`;
  }

  function htmlDecisao() {
    if (local.status !== 'pendente') {
      const d = local.decisao;
      return `<dl class="dados">
        <dt>Decisão</dt><dd>${selo(STATUS_LOCAL[local.status].rotulo, STATUS_LOCAL[local.status].variante)}</dd>
        <dt>Motivo</dt><dd>${esc(d.motivo)}</dd>
        <dt>Data</dt><dd>${esc(formatarDataHora(d.em))}</dd>
      </dl>`;
    }
    return `<p class="nota" style="margin-bottom:14px">Aprovar ou rejeitar exige um motivo, que fica registrado.</p>
      <div class="acoes">
        <button class="btn btn--positivo" type="button" data-acao="aprovar">Aprovar</button>
        <button class="btn btn--perigo" type="button" data-acao="rejeitar">Rejeitar</button>
      </div>`;
  }

  function desenhar() {
    removerMapa();
    const status = STATUS_LOCAL[local.status];
    area.innerHTML = `
      <div class="pagina__topo">
        <div>
          <h1>${esc(local.nome)}</h1>
          <p class="pagina__subtitulo">${esc(local.id)} · ${esc(ROTULO_TIPO[local.tipo])} enviada por ${esc(local.solicitante)} em ${esc(formatarDataHora(local.enviadoEm))}</p>
        </div>
        ${selo(status.rotulo, status.variante)}
      </div>
      ${local.observacao ? `<section class="cartao"><h2>Observação do solicitante</h2><p>${esc(local.observacao)}</p></section>` : ''}
      <section class="cartao" aria-labelledby="titulo-comparacao">
        <h2 id="titulo-comparacao">Atual × proposto</h2>
        ${htmlComparacao()}
      </section>
      <section class="cartao" aria-labelledby="titulo-mapa">
        <h2 id="titulo-mapa">Mapa</h2>
        <p class="nota" style="margin-bottom:10px">Cinza: posição atual. Verde: posição proposta.</p>
        <div class="mapa" data-mapa role="img" aria-label="Mapa com a posição do local"></div>
      </section>
      <section class="cartao" aria-labelledby="titulo-decisao">
        <h2 id="titulo-decisao">Decisão</h2>
        ${htmlDecisao()}
      </section>`;
    desenharMapa();
  }

  async function carregar() {
    area.innerHTML = htmlCarregando(8);
    try {
      local = await obterLocal(params.id);
    } catch {
      if (ativo) area.innerHTML = htmlErro();
      return;
    }
    if (!ativo) return;
    if (!local) {
      area.innerHTML = `
        <div class="estado">
          <div class="estado__icone" aria-hidden="true">🔍</div>
          <p class="estado__titulo">Pedido não encontrado</p>
          <p class="estado__texto">Não existe nenhum pedido com o código ${esc(params.id)}.</p>
          <a class="btn" href="#/locais">Voltar para a lista</a>
        </div>`;
      return;
    }
    desenhar();
  }

  async function decidir(aprovar) {
    const resposta = await confirmarAcao({
      titulo: aprovar ? 'Aprovar este pedido?' : 'Rejeitar este pedido?',
      texto: aprovar ? 'Os dados propostos passam a valer no mapa.' : 'Nada muda no mapa e o solicitante é avisado.',
      rotuloConfirmar: aprovar ? 'Aprovar' : 'Rejeitar',
      variante: aprovar ? 'positivo' : 'perigo',
      justificativa: { rotulo: 'Motivo' },
    });
    if (!resposta || !ativo) return;
    area.querySelectorAll('[data-acao]').forEach((b) => (b.disabled = true));
    try {
      await decidirLocal(local.id, { aprovar, motivo: resposta.justificativa });
      mostrarAviso({ titulo: 'Ação concluída', texto: aprovar ? 'O pedido foi aprovado.' : 'O pedido foi rejeitado.' });
    } catch {
      mostrarAviso({ tipo: 'erro', titulo: 'Não foi possível concluir', texto: 'Tente de novo em instantes.' });
    }
    if (ativo) desenhar();
  }

  area.addEventListener('click', (evento) => {
    const acao = evento.target.closest('[data-acao]')?.dataset.acao;
    if (acao === 'tentar-novo') carregar();
    else if (acao === 'aprovar') decidir(true);
    else if (acao === 'rejeitar') decidir(false);
  });

  carregar();
  return () => {
    ativo = false;
    removerMapa();
  };
}
