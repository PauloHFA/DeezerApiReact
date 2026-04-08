# PH Music — Deezer Clone

Clone de player musical usando Deezer API.

## Descrição

Um clone de interface de player de música inspirado no Deezer que permite buscar artistas, faixas, visualizar informações de artista, navegar por álbuns e playlists, e tocar previews de músicas em tempo real.

## Tech stack

- React 19 + Vite
- Material UI (MUI)
- Axios
- React Router DOM
- Deezer API

## Destaques técnicos

- Implementação de proxy `/api` no Vite para encaminhar chamadas ao endpoint oficial do Deezer sem problemas de CORS
- Estado global de player para gerenciar faixa atual, reprodução e fila
- Carregamento assíncrono de dados com `axios` e `React Hooks`
- Tratamento de erros básico com mensagens de fallback e loading states
- Design responsivo e visual moderno usando Material UI

## Funcionalidades

- Página inicial com artistas em destaque, top tracks e playlists
- Busca por artistas, faixas, álbuns e playlists
- Página de artista com álbumes e visualização de faixas
- Player fixo no rodapé com controles básicos de reprodução e volume
- Preview de faixas usando o `preview` retornado pela API do Deezer

## Como executar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173` no navegador.

## Scripts disponíveis

- `npm run dev` — Inicia o servidor de desenvolvimento Vite
- `npm run build` — Gera a versão de produção
- `npm run preview` — Visualiza a build de produção localmente
- `npm run lint` — Roda o ESLint no código

## Proxy e API

A configuração de proxy está em `vite.config.js`, e todas as requisições para `/api` são redirecionadas para `https://api.deezer.com`.

Exemplo:

- `/api/search/artist?q=nome` → `https://api.deezer.com/search/artist?q=nome`

## Deploy

Para um portfólio, recomendo publicar em:

- Vercel
- Netlify
- GitHub Pages

Inclua o link ativo do deploy no README.

## Sugestões para fortalecer o portfólio

- Adicionar páginas de álbum e playlist completas
- Centralizar o player global para tocar previews em qualquer página
- Implementar favoritos salvos no `localStorage`
- Criar modo claro/escuro
- Melhorar o tratamento de erros com toasts/snackbars
- Adicionar testes básicos com React Testing Library
- Publicar em Vercel ou Netlify e exibir o link no README

## Roadmap de implementação

Esse projeto já possui uma base sólida, e os próximos passos para torná-lo um portfólio forte são:

1. Completar as páginas de álbum e playlist com informações detalhadas e tracks navegáveis
2. Expandir a busca para artistas, faixas, álbuns e playlists e permitir a navegação direta dos cards para as páginas correspondentes
3. Centralizar o player global para gerenciar áudio, fila, reprodução e volume em toda a aplicação
4. Adicionar favoritos, histórico e fila persistente usando `localStorage`
5. Implementar modo claro/escuro com tema persistente
6. Adicionar tratamento de erro visual com toasts/snackbars e skeleton loaders
7. Escrever testes com React Testing Library para rotas, busca e player
8. Publicar em Vercel ou Netlify e exibir um link ativo no README

## Conclusão

O projeto já tem uma base muito boa e um visual atrativo. Para torná-lo um portfólio forte, foque em:

- funcionalidade completa de música (playlist/álbum/artist)
- player real centralizado
- limpeza de arquitetura de estado
- documentação clara e deploy público

Se quiser, posso ajudar a montar um roadmap de implementação passo a passo ou gerar os componentes de `Playlist`, `Album` e a versão em TypeScript.
