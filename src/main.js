// Ponto de entrada do painel administrativo do zac.
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/componentes.css';

import { iniciarRouter, verificarSessao } from './lib/router.js';

iniciarRouter();

// A cada 15 segundos confere se a sessão ainda é válida (RF-AUT-04).
setInterval(verificarSessao, 15000);
