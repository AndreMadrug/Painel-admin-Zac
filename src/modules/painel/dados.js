// Dados de EXEMPLO da Visão geral (dashboard).
import { simularRequisicao } from '../../lib/api.js';
import { inicioDoDia } from '../../lib/format.js';
import { contarPendentes } from '../disputas/dados.js';
import { contarDenunciasAbertas } from '../produtos/dados.js';
import { contarVendedoresAVerificar } from '../usuarios/dados.js';
import { contarLocaisAAprovar } from '../locais/dados.js';
import { contarChamadosAbertos } from '../suporte/dados.js';

const USUARIOS_TOTAL = 1284;

/** Gera números "parecidos com reais", sempre iguais para o mesmo dia. */
function valoresDoDia(data) {
  const n = Math.floor(data.getTime() / 86400000);
  const fimDeSemana = data.getDay() === 0 || data.getDay() === 6;
  const vendas = 900 + ((n * 37) % 11) * 140 + (fimDeSemana ? 450 : 0);
  return {
    vendas,
    pedidos: 7 + ((n * 13) % 9) + (fimDeSemana ? 3 : 0),
    novosUsuarios: 2 + ((n * 7) % 5),
  };
}

/** Resumo do período escolhido: cartões, pontos do gráfico e pendências (RF-DSH-01 a 04). */
export function obterResumo(inicio, fim) {
  return simularRequisicao(() => {
    const dias = [];
    const totais = { vendas: 0, pedidos: 0, novosUsuarios: 0 };

    for (let dia = inicioDoDia(inicio); dia <= fim; dia.setDate(dia.getDate() + 1)) {
      const v = valoresDoDia(dia);
      dias.push({
        rotulo: dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        vendas: v.vendas,
        pedidos: v.pedidos,
      });
      totais.vendas += v.vendas;
      totais.pedidos += v.pedidos;
      totais.novosUsuarios += v.novosUsuarios;
    }

    return {
      dias,
      usuariosTotal: USUARIOS_TOTAL,
      novosUsuarios: totais.novosUsuarios,
      vendas: totais.vendas,
      pedidos: totais.pedidos,
      doacoes: totais.vendas * 0.02,
      // Cada atalho leva direto à tela principal do módulo, sem passar pelo menu.
      pendencias: [
        { rotulo: 'Disputas abertas', quantidade: contarPendentes(), rota: '#/disputas' },
        { rotulo: 'Denúncias', quantidade: contarDenunciasAbertas(), rota: '#/produtos-e-denuncias' },
        { rotulo: 'Vendedores a verificar', quantidade: contarVendedoresAVerificar(), rota: '#/usuarios-e-vendedores' },
        { rotulo: 'Locais a aprovar', quantidade: contarLocaisAAprovar(), rota: '#/locais' },
        { rotulo: 'Chamados abertos', quantidade: contarChamadosAbertos(), rota: '#/impacto-e-suporte' },
      ],
    };
  });
}
