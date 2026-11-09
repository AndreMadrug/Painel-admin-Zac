// Simula o back-end enquanto as telas usam dados de exemplo.
// Quando a API real existir, só este arquivo (e os arquivos "dados.js" dos módulos) mudam.

export const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

/**
 * Simula o carregamento de dados.
 * Para testar a tela de erro, abra a página com "?erro=1" no fim do endereço.
 * Exemplo: http://localhost:5173/#/financeiro?erro=1
 */
export async function simularRequisicao(obterDados, atraso = 450) {
  await esperar(atraso);
  if (location.hash.includes('erro=1')) {
    throw new Error('Falha simulada ao carregar os dados.');
  }
  return obterDados();
}

/**
 * Simula uma ação do administrador (aprovar, negar, reembolsar...).
 * Para testar o aviso de falha, use "?erroacao=1" no fim do endereço.
 */
export async function simularAcao(executar, atraso = 600) {
  await esperar(atraso);
  if (location.hash.includes('erroacao=1')) {
    throw new Error('Falha simulada ao executar a ação.');
  }
  return executar();
}
