// Controle da sessão do administrador (RF-AUT-02 e RF-AUT-04).
// Por enquanto a sessão é simulada no navegador. Com o back-end, vira um token real.
import { lerEstado, salvarEstado, removerEstado } from './estado.js';
import { SESSAO_MINUTOS } from '../config/app.js';

const CHAVE = 'sessao';

export function iniciarSessao(usuario) {
  salvarEstado(CHAVE, {
    nome: usuario.nome,
    email: usuario.email,
    expiraEm: Date.now() + SESSAO_MINUTOS * 60 * 1000,
  });
}

/** Retorna a sessão se ela existe e ainda está válida; senão, null. */
export function sessaoAtual() {
  const sessao = lerEstado(CHAVE);
  if (!sessao || Date.now() > sessao.expiraEm) return null;
  return sessao;
}

/** true quando havia uma sessão, mas o tempo dela acabou. */
export function sessaoExpirou() {
  const sessao = lerEstado(CHAVE);
  return Boolean(sessao) && Date.now() > sessao.expiraEm;
}

export function encerrarSessao() {
  removerEstado(CHAVE);
}
