// Guarda pequenas informações na sessão do navegador (some ao fechar a aba).
// Usado para lembrar filtros ao voltar do detalhe (RI-02) e para a sessão do admin.

const PREFIXO = 'zac:';

export function lerEstado(chave, padrao = null) {
  try {
    const bruto = sessionStorage.getItem(PREFIXO + chave);
    return bruto ? JSON.parse(bruto) : padrao;
  } catch {
    return padrao;
  }
}

export function salvarEstado(chave, valor) {
  try {
    sessionStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
  } catch {
    /* sem armazenamento disponível: segue sem lembrar */
  }
}

export function removerEstado(chave) {
  try {
    sessionStorage.removeItem(PREFIXO + chave);
  } catch {
    /* ignora */
  }
}
