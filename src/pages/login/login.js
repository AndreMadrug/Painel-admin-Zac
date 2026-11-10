// Tela 1 — Login do administrador (RF-AUT-01 e RF-AUT-03).
import { autenticar } from '../../modules/autenticacao/dados.js';
import { iniciarSessao } from '../../lib/sessao.js';
import logoUrl from '../../assets/logo-zac.png';

const MENSAGENS = {
  credenciais: 'E-mail ou senha incorretos. Confira os dados e tente de novo.',
  permissao: 'Acesso negado. Esta conta não tem permissão para usar o painel administrativo.',
};

export function paginaLogin({ container }) {
  const sessaoExpirada = location.hash.includes('expirada=1');

  container.innerHTML = `
    <div class="login">
      <div class="login__cartao">
        <img class="login__logo" src="${logoUrl}" alt="zac Marketplace Comunitário" />
        <h1 class="login__titulo">Painel administrativo</h1>

        ${
          sessaoExpirada
            ? '<p class="faixa faixa--info" role="status">Sua sessão expirou. Entre novamente para continuar.</p>'
            : ''
        }
        <p class="faixa" id="login-erro" role="alert" hidden></p>

        <form novalidate>
          <label class="campo">
            <span>E-mail</span>
            <input type="email" name="email" autocomplete="username" aria-describedby="erro-email" />
            <span class="campo__erro" id="erro-email"></span>
          </label>
          <label class="campo">
            <span>Senha</span>
            <input type="password" name="senha" autocomplete="current-password" aria-describedby="erro-senha" />
            <span class="campo__erro" id="erro-senha"></span>
          </label>
          <button class="btn btn--grande" type="submit">Entrar</button>
        </form>

        <p class="login__teste">
          <strong>Ambiente de desenvolvimento.</strong> Dados de teste: admin@zac.com.br / zac123.
          Para ver o "acesso negado": comprador@zac.com.br / zac123.
        </p>
      </div>
    </div>`;

  const formulario = container.querySelector('form');
  const faixaErro = container.querySelector('#login-erro');
  const botao = formulario.querySelector('button');

  function marcarErro(campo, mensagem) {
    const entrada = formulario.elements[campo];
    container.querySelector(`#erro-${campo}`).textContent = mensagem;
    if (mensagem) entrada.setAttribute('aria-invalid', 'true');
    else entrada.removeAttribute('aria-invalid');
  }

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    faixaErro.hidden = true;

    const email = formulario.elements.email.value.trim();
    const senha = formulario.elements.senha.value;

    // RI-06: valida antes de enviar e mostra o erro junto ao campo.
    marcarErro('email', !email ? 'Informe o e-mail.' : !/^\S+@\S+\.\S+$/.test(email) ? 'Informe um e-mail válido.' : '');
    marcarErro('senha', !senha ? 'Informe a senha.' : '');
    const primeiroInvalido = formulario.querySelector('[aria-invalid="true"]');
    if (primeiroInvalido) {
      primeiroInvalido.focus();
      return;
    }

    botao.disabled = true;
    botao.textContent = 'Entrando…';
    const resultado = await autenticar(email, senha);

    if (!resultado.ok) {
      faixaErro.textContent = MENSAGENS[resultado.motivo];
      faixaErro.hidden = false;
      botao.disabled = false;
      botao.textContent = 'Entrar';
      return;
    }

    iniciarSessao(resultado.usuario);
    location.hash = '#/visao-geral';
  });

  formulario.elements.email.focus();
}
