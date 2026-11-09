# Painel Admin Zac

Painel administrativo do Zac Marketplace Comunitário (Cabo de Santo Agostinho).
MVP 1, Parte 1: somente front-end, com dados de exemplo.

## Stack

HTML, CSS e JavaScript (ES Modules), com Vite como ferramenta de desenvolvimento e build.
Bibliotecas: Chart.js (gráficos) e Leaflet (mapa).
Qualidade: ESLint, Prettier, Vitest, Husky, lint-staged e commitlint.
Integração contínua: GitHub Actions. Publicação: Vercel.

## Como rodar

Pré-requisito: Node 22 ou superior.

```bash
git clone https://github.com/AndreMadrug/Painel-admin-Zac.git
cd Painel-admin-Zac
cp .env.example .env
npm ci
npm run dev
```

## Scripts

| Comando           | O que faz                            |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Servidor de desenvolvimento          |
| `npm run build`   | Gera a versão de produção em `dist/` |
| `npm run preview` | Serve o build localmente             |
| `npm run lint`    | Verifica o código com ESLint         |
| `npm run format`  | Formata com Prettier                 |
| `npm test`        | Roda os testes com Vitest            |

## Estrutura

cat > CONTRIBUTING.md << 'EOF'

# Como contribuir

## Branches

- `main`: produção. Só recebe PR vindo da `develop`.
- `develop`: integração e ambiente de desenvolvimento.
- Trabalho novo: crie a branch a partir da `develop`, com os prefixos `feat/`, `fix/`, `chore/`, `docs/` ou `refactor/`. Exemplo: `feat/financeiro-lista`.

## Commits (Conventional Commits)

Formato: `tipo(escopo): descrição curta em minúsculas`

Exemplos:

- `feat(financeiro): adiciona lista de movimentações`
- `fix(auth): corrige redirecionamento sem sessão`
- `chore: atualiza dependências`

Tipos: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`.
Commits fora do padrão são rejeitados pelo hook.

## Pull Requests

1. Abra o PR para `develop`, preenchendo o template.
2. Peça revisão da outra pessoa da equipe.
3. O CI precisa estar verde.
4. Faça o merge com Squash and merge.

## Padrões de código

- JavaScript em módulos (`import`/`export`), sem variáveis globais.
- Sem `onclick="..."` no HTML: eventos ficam no JS.
- Classes CSS em kebab-case, cores apenas pelas variáveis de `src/styles/tokens.css`.
- Dados sempre via o `service` do módulo, nunca direto dos mocks na página.
- Texto vindo de dados entra com `textContent` ou com escape, nunca com `innerHTML` cru.
- Status sempre com cor e texto.
- O que for usado em dois módulos vai para `src/components/`.
