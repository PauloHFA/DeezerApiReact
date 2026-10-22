# PH Music — Deezer Clone

Aplicação web de player musical construída com React 19 e Vite, integrando a API pública do Deezer para busca e reprodução de áudio em tempo real.

## Visão Geral

PH Music é uma aplicação de reference que demonstra padrões modernos de desenvolvimento web, incluindo:

- Gerenciamento de estado centralizado com React Context API
- Integração com API externa (Deezer) via proxy Axios
- Componentes reutilizáveis com Material UI v7
- Roteamento client-side com React Router DOM v7.5
- Tratamento de erros com Error Boundary e notificações Toast
- Loading states otimizados com Skeleton Loaders
- Persistência de dados com localStorage

## Arquitetura Técnica

### Stack Principal

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | React | 19 |
| Build Tool | Vite | 6.2 |
| UI Library | Material UI | 7 |
| HTTP Client | Axios | - |
| Roteamento | React Router DOM | 7.5 |
| API Backend | Deezer Public API | v2 |

### Padrões de Arquitetura

- **Context API**: Gerenciamento de estado do player (`PlayerContext`)
- **Custom Hooks**: `usePlayer`, `useNotification`, `useFavorites`, `useDebounce`, `useLocalStorage`
- **Component Composition**: Separação clara entre Page Components, UI Components e Hooks
- **Error Boundary**: Tratamento centralizado de erros em componentes
- **Service Layer**: `deezerApi.js` com abstração de chamadas HTTP

### Estrutura de Pastas

```
src/
├── components/          # Componentes de UI reutilizáveis
│   ├── Navbar.jsx
│   ├── Player.jsx
│   ├── ErrorBoundary.jsx
│   ├── NotificationContainer.jsx
│   └── SkeletonLoader.jsx
├── pages/              # Page components para roteamento
│   ├── Home.jsx
│   ├── Search.jsx
│   ├── Artist.jsx
│   ├── Album.jsx
│   └── Playlist.jsx
├── services/           # Integração com APIs
│   └── deezerApi.js
├── contexts/           # React Context providers
│   ├── PlayerContext.jsx
│   └── NotificationContext.jsx
├── hooks/              # Custom React hooks
│   ├── usePlayer.js
│   ├── useNotification.js
│   ├── useFavorites.js
│   ├── useDebounce.js
│   └── useLocalStorage.js
└── App.jsx             # Root component com providers
```

## Funcionalidades Implementadas

### Busca e Navegação
- Busca em tempo real com debounce (500ms) para artistas, faixas, álbuns e playlists
- Navegação direta de cards para páginas de detalhe
- Página inicial com artistas em destaque, top tracks e playlists recomendadas

### Detalhes de Conteúdo
- Página de artista com listagem de álbuns e visualização de faixas
- Página de álbum com metadados (ano, duração, gênero) e track listing
- Página de playlist com informações do criador e composição

### Reprodução de Áudio
- Player fixo no rodapé com controles de play/pause, volume e fila
- Prévia (preview) de 30s de faixas selecionadas via Deezer API
- Reprodução de faixas pelo YouTube com busca via YouTube Data API v3 e player incorporado (IFrame Player API)
- Busca de vídeos incorporáveis e link para abrir no YouTube quando o vídeo não puder tocar incorporado
- Sincronização de estado de reprodução entre componentes

### Estado e Persistência
- Favoritos (artistas, álbuns, playlists, faixas) persistidos em localStorage
- Sistema de notificações Toast (success, error, warning, info)
- Fila de reprodução e histórico de até 300 reproduções e 100 buscas
- Listas inteligentes por reproduções recentes, faixas mais ouvidas e resultados de buscas
- Playlists próprias editáveis; convidado usa armazenamento local e a conta Supabase opcional sincroniza a biblioteca

### UX/Loading States
- Skeleton loaders para cards durante carregamento
- Error Boundary para tratamento de erros de React
- Loading indicators progressivos (spinner, shimmer effects)
- Empty states informativos

## Configuração e Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Setup Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Analysar código com ESLint
npm run lint
```

Aplicação será acessível em `http://localhost:5173` com HMR (Hot Module Replacement) habilitado.

### Chave da YouTube Data API

Para habilitar a busca automática de vídeos, crie uma chave no [Google Cloud Console](https://console.cloud.google.com/apis/credentials), habilite a **YouTube Data API v3** no projeto e adicione ao arquivo `.env` na raiz:

```env
VITE_YOUTUBE_API_KEY=sua_chave_do_youtube
```

Reinicie o servidor (`npm run dev`) após alterar o `.env`. O arquivo `.env` é local e está ignorado pelo Git. Não publique nem faça commit de chaves. Como variáveis `VITE_*` são incorporadas ao código enviado ao navegador, a chave **não é secreta**: restrinja-a por referenciador HTTP aos domínios usados (incluindo `localhost:5173` no desenvolvimento) e limite a chave à **YouTube Data API v3** no Google Cloud Console.

Essa chave é usada para pesquisar vídeos e selecionar resultados marcados como incorporáveis; ela não habilita a reprodução de qualquer vídeo. O player de reprodução usa a YouTube IFrame Player API. Vídeos com incorporação bloqueada, indisponíveis na região ou removidos podem falhar; nesses casos, o player apresenta um link para abrir o vídeo diretamente no YouTube.

### Login opcional e playlists pessoais

O PH Music pode ser usado sem conta. No modo convidado, histórico de buscas/reproduções e playlists próprias ficam no armazenamento local do navegador. Para habilitar cadastro e login por e-mail/senha, login Google e sincronização, crie um projeto Supabase, configure estas variáveis no `.env` local e reinicie o Vite:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_publica
```

Execute [`supabase/schema.sql`](./supabase/schema.sql) no SQL Editor do projeto Supabase para criar a tabela de biblioteca e as políticas RLS que restringem cada conta aos próprios dados. No painel do Supabase, habilite os provedores **Email** e **Google** e adicione a URL local/de produção à lista de redirecionamentos permitidos. A chave `anon` é pública no cliente; a proteção dos dados depende das políticas RLS. Nunca coloque a `service_role` key em variáveis `VITE_*` nem no navegador.

#### Estratégia de usuários e armazenamento

- **Identidade e autenticação:** os usuários são criados e autenticados pelo Supabase Auth, usando e-mail/senha ou Google OAuth. O PH Music não mantém nem armazena senhas próprias; recebe do Supabase a sessão e o identificador (`auth.users.id`) da conta.
- **Modo convidado:** não exige cadastro. Histórico e playlists ficam no `localStorage` do dispositivo, sob a chave `ph-music-library-guest`.
- **Conta autenticada:** o navegador mantém um cache local por conta (`ph-music-library-user:<userId>`), e a nuvem armazena a biblioteca na tabela `public.user_music_libraries`. Cada linha tem `user_id` como chave estrangeira para `auth.users`, um `payload` JSONB com playlists e históricos, e `updated_at`.
- **Acesso aos dados:** a tabela tem RLS habilitada; a política permite operações apenas quando `auth.uid() = user_id`. O cliente usa somente a chave pública `anon`, nunca a `service_role`. O esquema é uma biblioteca agregada em JSONB por usuário, não tabelas relacionais separadas para cada faixa ou playlist.
- **Entrada e sincronização:** ao autenticar, o app combina a biblioteca remota, o cache local daquela conta e a biblioteca convidada. Históricos são unidos por identificador e ordenados por data; playlists com o mesmo ID são combinadas, com faixas sem duplicatas por ID. O resultado fica limitado a 300 reproduções e 100 buscas. Após a sincronização bem-sucedida, o cache de convidado é removido para evitar que dados antigos reapareçam em logins futuros. Se a sincronização falhar, a biblioteca local da conta e a de convidado continuam disponíveis, e o app apresenta um aviso de sincronização.

#### Como são calculadas as listas personalizadas

As três listas são calculadas no cliente a partir dos dados que o próprio usuário gera neste app; não há algoritmo de machine learning, perfilamento externo ou recomendação enviada pela Deezer:

1. **Tocadas recentemente:** ordena as reproduções da mais recente para a mais antiga, remove faixas repetidas e exibe até 30.
2. **Suas mais ouvidas:** conta as reproduções por ID de faixa, ordena pela contagem decrescente e usa a reprodução mais recente como critério de desempate; exibe até 30.
3. **Descobertas das suas buscas:** reúne as faixas dos resultados de buscas concluídas, das pesquisas mais recentes para as antigas, elimina IDs repetidos e exibe até 30. O histórico guarda até 100 buscas.

As recomendações são atualizadas conforme o histórico muda. Reproduções realizadas em fontes suportadas pelo player e buscas que retornam faixas são registradas na biblioteca. O login é opcional: as mesmas listas e playlists próprias ficam disponíveis localmente no modo convidado. As playlists podem ser criadas, renomeadas e excluídas, e faixas podem ser adicionadas pelos resultados da busca.

### Proxy de API

O Vite está configurado para fazer proxy das requisições `/api` para o endpoint oficial da Deezer, contornando CORS:

**vite.config.js:**
```javascript
proxy: {
  '/api': {
    target: 'https://api.deezer.com',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

**Exemplo de requisição:**
```
Cliente: GET /api/search/artist?q=david
↓ (rewritado)
Deezer: GET https://api.deezer.com/search/artist?q=david
```

## API Reference

### Endpoints Utilizados

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/search/artist?q={query}` | GET | Busca artistas por termo |
| `/search/track?q={query}` | GET | Busca faixas por termo |
| `/search/album?q={query}` | GET | Busca álbuns por termo |
| `/search/playlist?q={query}` | GET | Busca playlists por termo |
| `/artist/{id}` | GET | Detalhes do artista |
| `/artist/{id}/albums` | GET | Álbuns de um artista |
| `/album/{id}` | GET | Detalhes do álbum |
| `/album/{id}/tracks` | GET | Faixas de um álbum |
| `/playlist/{id}` | GET | Detalhes da playlist |
| `/track/{id}` | GET | Detalhes da faixa (inclui URL de preview) |

### Exemplo de Resposta

```json
{
  "id": 123456,
  "title": "Song Name",
  "artist": {
    "id": 654321,
    "name": "Artist Name"
  },
  "album": {
    "id": 789012,
    "title": "Album Name",
    "cover_medium": "https://..."
  },
  "duration": 180,
  "preview": "https://cdns-files-c.dzcdn.net/..."
}
```

## Performance e Otimizações

- **Code Splitting**: Lazy loading de rotas com React Router
- **Debounce**: Requisições de busca debounceadas para reduzir tráfego
- **Skeleton Loaders**: Estados de carregamento sem flash de conteúdo vazio
- **Memoização**: Context API com callbacks memoizados para avoid rerenders desnecessários
- **localStorage**: Cache de favoritos e dados persistentes no client

## State Management

### PlayerContext
- Estado: `currentTrack`, `isPlaying`, `volume`, `queue`, `previewUrl`, `currentlyPlaying`
- Ações: `playTrack()`, `pauseTrack()`, `togglePlayPause()`, `setPlayerVolume()`, `playNext()`, `playPreview()`, `stopPreview()`

### NotificationContext
- Métodos: `success()`, `error()`, `warning()`, `info()`
- Auto-dismiss após 3s (configurável)
- Stack de notificações com z-index management

### useFavorites Hook
- Gerencia favoritos por tipo (artists, albums, playlists, tracks)
- Sincroniza com localStorage automaticamente
- Métodos: `addFavorite()`, `removeFavorite()`, `toggleFavorite()`, `isFavorite()`

## Build e Deploy

### Desenvolvimento

```bash
npm run dev
# Vite com HMR em http://localhost:5173
```

### Produção

```bash
npm run build
# Gera dist/ otimizado
# - CSS minificado
# - JS bundles chunked
# - Assets otimizados
```

**Tamanho do bundle (gzip): ~188.86 KB**

### Plataformas de Deploy Recomendadas

- **Vercel**: Deploy automático com git, serverless functions
- **Netlify**: Deploy via git ou CLI, prebuild scripts
- **Azure Static Web Apps**: Integração com Azure, preview environments
- **GitHub Pages**: Deploy estático simples

## Roadmap Técnico

### Phase 1: Arquitetura de Estado (Concluída)
- [x] PlayerContext para gerenciamento centralizado
- [x] Error Boundary com tratamento graceful
- [x] Notification system com Toast components
- [x] Custom hooks reutilizáveis

### Phase 2: Features Principais (Concluída)
- [x] Album e Playlist pages com track listing
- [x] Busca multi-tipo (artista, faixa, álbum, playlist)
- [x] Navegação entre componentes ligados
- [x] Favoritos com localStorage

### Phase 3: UX/Otimizações (Concluída)
- [x] Skeleton loaders durante carregamento
- [x] Debounce de busca (500ms)
- [x] Empty states informativos
- [x] Error boundaries e tratamento de falhas

### Phase 4: Melhorias Futuras (Backlog)
- [ ] TypeScript migration para type safety
- [ ] Testes unitários com Vitest/Jest
- [ ] Testes de integração com React Testing Library
- [ ] Theme toggle (light/dark mode)
- [ ] Histórico de pesquisa persistido
- [ ] Recomendações baseadas em reprodução
- [ ] i18n (internacionalização)
- [ ] PWA capabilities (offline support)
- [ ] Analytics com Application Insights
- [ ] Performance metrics e monitoring

## Tratamento de Erros

### Error Boundary
- Captura erros não tratados em componentes React
- Exibe UI de erro com botão de recovery
- Logs de erro em desenvolvimento

### API Error Handling
- Retry automático com fallback graceful
- Notificações de erro via Toast
- Validação de response antes de render

### Validação de Dados
- Schema validation antes de atualizar state
- Type checking em endpoints críticos
- Fallbacks para dados faltantes

## Variáveis de Ambiente

```env
# .env (arquivo local, não versionar)
VITE_YOUTUBE_API_KEY=sua_chave_do_youtube
VITE_API_BASE_URL=/api
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_publica
```

## Dependências Principais

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.5.0",
    "axios": "^1.x",
    "@mui/material": "^7.x",
    "@mui/icons-material": "^7.x"
  },
  "devDependencies": {
    "vite": "^6.2.5",
    "eslint": "^8.x",
    "@vitejs/plugin-react": "^4.x"
  }
}
```

## Contribuição e Melhorias

Issues e pull requests são bem-vindos. Para mudanças maiores:

1. Fork o repositório
2. Crie uma branch para a feature (`git checkout -b feature/AmazingFeature`)
3. Commit as mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

MIT

## Referências

- [Deezer API Documentation](https://developers.deezer.com/api)
- [React 19 Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [Material UI Components](https://mui.com/components/)
- [React Router](https://reactrouter.com/)
