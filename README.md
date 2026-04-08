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
- Sincronização de estado de reprodução entre componentes

### Estado e Persistência
- Favoritos (artistas, álbuns, playlists, faixas) persistidos em localStorage
- Sistema de notificações Toast (success, error, warning, info)
- Histórico de buscas e fila de reprodução

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
# .env
VITE_API_BASE_URL=http://localhost:5173/api
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

