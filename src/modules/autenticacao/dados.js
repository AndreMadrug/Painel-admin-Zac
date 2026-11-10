// Autenticação de EXEMPLO. Será trocada pela chamada real ao back-end.
import { esperar } from '../../lib/api.js';

const USUARIOS = [
  { email: 'admin@zac.com.br', senha: 'zac123', nome: 'Maria Eduarda', papel: 'admin' },
  // Conta sem permissão: serve para testar a mensagem de "acesso negado".
  { email: 'comprador@zac.com.br', senha: 'zac123', nome: 'Cliente do app', papel: 'comprador' },
];

/**
 * Resultado possível:
 *  { ok: true, usuario }
 *  { ok: false, motivo: 'credenciais' }  -> e-mail ou senha incorretos
 *  { ok: false, motivo: 'permissao' }    -> conta existe, mas não é de administrador
 */
export async function autenticar(email, senha) {
  await esperar(600);
  const usuario = USUARIOS.find((u) => u.email === email.trim().toLowerCase() && u.senha === senha);
  if (!usuario) return { ok: false, motivo: 'credenciais' };
  if (usuario.papel !== 'admin') return { ok: false, motivo: 'permissao' };
  return { ok: true, usuario };
}
