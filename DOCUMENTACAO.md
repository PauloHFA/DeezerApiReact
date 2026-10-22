# PH Music - Documentação do Projeto

## 📋 Visão Geral

**PH Music** é uma aplicação web de player musical construída com **React 19** e **Vite**, que integra a **API pública do Deezer** para busca e reprodução de áudio em tempo real, com suporte a **YouTube** e **Spotify** para reprodução completa de faixas.

---

## 🎯 Proposta do Programa

O PH Music nasceu como um **clone educacional do Deezer** para demonstrar padrões modernos de desenvolvimento web full-stack frontend, incluindo:

1. **Integração multi-API** - Deezer (busca/metadados) + YouTube (fallback) + Spotify (streaming completo)
2. **Gerenciamento de estado avançado** - React Context API com múltiplas fontes de reprodução
3. **Arquitetura escalável** - Separação clara entre serviços, hooks, contextos e componentes
4. **Experiência de usuário rica** - Player unificado com seletor de fonte, progress bar, queue
5. **Autenticação OAuth segura** - PKCE flow para Spotify sem expor secrets no frontend

---

## ✅ Requisitos Atendidos

### 1. Busca e Navegação
- [x] Busca em tempo real com **debounce (500ms)** para artistas, faixas, álbuns e playlists
- [x] Navegação direta de cards para páginas de detalhe
- [x] Página inicial com artistas em destaque, top tracks e playlists recomendadas
- [x] Roteamento client-side com **React Router DOM v7.5**

### 2. Detalhes de Conteúdo
- [x] Página de artista com listagem de álbuns e visualização de faixas expansível
- [x] Página de álbum com metadados (ano, duração, gênero) e track listing
- [x] Página de playlist com informações do criador e composição

### 3. Reprodução de Áudio (TRIPLE SOURCE)
| Fonte | Duração | Controles | Status |
|-------|---------|-----------|--------|
| **Deezer Preview** | 30s | Play/Pause, Volume, Progress | ✅ Implementado |
| **YouTube Player API** | Completa | Play/Pause, Volume, Seek, Progress, Auto-next | ✅ Implementado |
| **Spotify Web Playback SDK** | Completa (Premium) | Play/Pause, Volume, Seek, Next/Prev, Device management | ✅ Implementado |

### 4. Player Unificado
- [x] Player fixo no rodapé com controles unificados
- [x] **Seletor de fonte** (Deezer/YouTube/Spotify) com badges visuais
- [x] Progress bar clicável com expansão para player YouTube/Spotify
- [x] Volume slider sincronizado entre fontes
- [x] Queue de reprodução (próxima/anterior)
- [x] Sincronização de estado entre componentes

### 5. Matching Inteligente de Tracks
- [x] Busca automática no YouTube via **YouTube Data API v3**
- [x] Busca automática no Spotify via **Spotify Web API** (com OAuth)
- [x] Algoritmo de similaridade (Jaro-Winkler + duração) para match preciso
- [x] Cache de resultados para performance
- [x] Confiança do match: high/medium/low/none

### 6. Autenticação Spotify (OAuth PKCE)
- [x] Fluxo **PKCE (Proof Key for Code Exchange)** - seguro para SPA
- [x] Geração de `code_verifier` + `code_challenge` (SHA-256)
- [x] Armazenamento de tokens em `sessionStorage`
- [x] Refresh automático de access token
- [x] Páginas dedicadas: `/auth/spotify` (login) + `/callback` (callback)

### 7. Estado e Persistência
- [x] Favoritos (artistas, álbuns, playlists, faixas) persistidos em **localStorage**
- [x] Sistema de notificações Toast (success, error, warning, info)
- [x] Histórico de até 300 reproduções e 100 buscas, e fila de reprodução
- [x] Biblioteca pessoal para convidados com armazenamento local e sincronização opcional por conta no Supabase
- [x] Playlists próprias editáveis e listas inteligentes calculadas a partir das buscas e reproduções

### 8. UX/Loading States
- [x] **Skeleton loaders** para cards durante carregamento
- [x] **Error Boundary** para tratamento de erros de React
- [x] Loading indicators progressivos (spinner, shimmer effects)
- [x] Empty states informativos
- [x] Lazy loading de páginas com `React.lazy` + `Suspense`

---

## 🏗️ Arquitetura Técnica

### Stack Principal
| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | React | 19 |
| Build Tool | Vite | 6.2 |
| UI Library | Material UI | 7 |
| HTTP Client | Axios | 1.16 |
| Roteamento | React Router DOM | 7.5 |
| API Backend | Deezer Public API | v2 |
| YouTube | YouTube Data API v3 + IFrame Player API | - |
| Spotify | Spotify Web API + Web Playback SDK | - |

### Estrutura de Pastas
```
src/
├── components/          # Componentes de UI reutilizáveis
│   ├── CardComponents.tsx    # ArtistCard, TrackCard, AlbumCard, PlaylistCard
│   ├── ErrorBoundary.tsx     # Error boundary React
│   ├── Navbar.tsx            # Barra de navegação + botão Spotify
│   ├── NotificationContainer.tsx # Toast notifications
│   ├── Player.tsx            # Player principal unificado
│   └── SkeletonLoader.tsx    # Skeleton components
├── contexts/            # React Context providers
│   ├── NotificationContext.tsx # Notifications state
│   └── PlayerContext.tsx     # Player state + 3 sources
├── hooks/               # Custom React hooks
│   ├── useDebounce.ts        # Debounce para busca
│   ├── useFavorites.ts       # Favoritos + localStorage
│   ├── useLocalStorage.ts    # Hook genérico localStorage
│   ├── useNotification.ts    # Acesso ao NotificationContext
│   ├── usePlayer.ts          # Acesso ao PlayerContext
│   └── useQuery.ts           # Cache de queries assíncronas
├── pages/               # Page components (rotas)
│   ├── Home.tsx              # Landing + featured content
│   ├── Search.tsx            # Busca unificada
│   ├── Artist.tsx            # Detalhes do artista
│   ├── Album.tsx             # Detalhes do álbum
│   ├── Playlist.tsx          # Detalhes da playlist
│   ├── SpotifyLogin.tsx      # Inicia OAuth Spotify
│   └── SpotifyCallback.tsx   # Callback OAuth
├── services/            # Integração com APIs externas
│   ├── apiClient.ts          # Axios wrapper com retry/backoff
│   ├── deezerApi.ts          # Deezer API endpoints
│   ├── youtubeApi.ts         # YouTube Data API search
│   ├── youtubePlayer.ts      # YT.Player wrapper controlável
│   ├── spotifyApi.ts         # Spotify Web API + OAuth PKCE
│   ├── spotifyWebPlayback.ts # Web Playback SDK wrapper
│   └── trackMatching.ts      # Matching Deezer→YouTube/Spotify
├── types/               # TypeScript definitions
│   └── index.ts              # Artist, Album, Track, Playlist, etc.
├── App.tsx              # Root component com providers
└── main.tsx             # Entry point
```

---

## 🔧 Configuração Necessária

### Variáveis de Ambiente (`.env`)
```env
# YouTube Data API v3 Key
# Get from: https://console.cloud.google.com/apis/credentials
VITE_YOUTUBE_API_KEY=sua_chave_do_youtube

# Spotify API Credentials
# Get from: https://developer.spotify.com/dashboard/
VITE_SPOTIFY_CLIENT_ID=seu_client_id
VITE_SPOTIFY_CLIENT_SECRET=seu_client_secret

# Spotify Redirect URI (must match Spotify Dashboard)
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback

# Deezer API (already works via Vite proxy)
VITE_API_BASE_URL=/api

# Login opcional e sincronização de biblioteca via Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_publica
```

O arquivo `.env` deve ficar na raiz do projeto, é local e está ignorado pelo Git. Nunca faça commit nem compartilhe a chave. Como `VITE_*` é substituído durante o build e fica acessível no navegador, essa chave não pode ser considerada secreta. No Google Cloud Console, habilite a **YouTube Data API v3**, limite a chave a essa API e aplique restrições de referenciador HTTP para os domínios permitidos (por exemplo, `localhost:5173` durante o desenvolvimento). Depois de alterar o `.env`, reinicie o servidor Vite.

**Atenção:** a chave da Data API é usada para buscar vídeos; não é necessária para carregar a YouTube IFrame Player API. O player escolhe resultados marcados como incorporáveis, mas o proprietário do vídeo, a região ou o próprio YouTube ainda podem impedir reprodução em iframe. Quando isso ocorrer, a interface oferece a opção de abrir o vídeo diretamente no YouTube.

### Login opcional e biblioteca pessoal

O uso do app e a reprodução continuam disponíveis sem autenticação. No modo convidado, o histórico de buscas e reproduções e as playlists criadas ficam no `localStorage` do navegador. Ao entrar, o app mescla os dados locais à biblioteca da conta e sincroniza a biblioteca com o Supabase.

1. Crie um projeto no [Supabase](https://supabase.com/dashboard) e adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` ao `.env` local.
2. No SQL Editor do projeto, execute [`supabase/schema.sql`](./supabase/schema.sql). A tabela usa Row Level Security (RLS) para que cada usuário só possa ler e alterar a própria biblioteca.
3. Ative os provedores **Email** e **Google** em Authentication → Providers. Para Google, configure as credenciais OAuth no Google Cloud e no painel do Supabase.
4. Em Authentication → URL Configuration, autorize a URL de desenvolvimento e a URL de produção como redirecionamentos.
5. Reinicie `npm run dev` depois de alterar o `.env`.

O menu **Minhas listas** inclui as listas inteligentes **Tocadas recentemente**, **Suas mais ouvidas** e **Descobertas das suas buscas**, além de playlists próprias. Na busca, use o botão de adicionar faixa para incluir resultados em uma playlist ou criar uma nova. As variáveis `VITE_*` ficam disponíveis no navegador: a anon key do Supabase é feita para uso público com RLS habilitado; nunca use a chave `service_role` no frontend.

#### Estratégia de usuários e armazenamento

- **Identidade:** o Supabase Auth gerencia as contas, a autenticação por e-mail/senha e o OAuth com Google. O aplicativo não armazena senhas; utiliza a sessão e o UUID do usuário fornecidos pelo Supabase (`auth.users.id`).
- **Convidado:** sem login, a biblioteca persiste no `localStorage` do navegador, em `ph-music-library-guest`. O uso e a reprodução continuam disponíveis sem conta.
- **Conta:** existe um cache local isolado por usuário, `ph-music-library-user:<userId>`, e uma linha de nuvem na tabela `public.user_music_libraries`. O campo `user_id` referencia `auth.users.id`; `payload` guarda, em JSONB, playlists próprias, histórico de reprodução e histórico de buscas; `updated_at` registra a última atualização.
- **Segurança:** o SQL habilita Row Level Security (RLS) e limita cada operação a `auth.uid() = user_id`. O frontend utiliza a chave pública `anon`, protegida por RLS. A chave `service_role` não deve ser inserida em variáveis `VITE_*` nem enviada ao navegador. Como o payload é um documento JSONB por conta, ele não cria registros relacionais individuais para cada faixa.
- **Mesclagem:** ao entrar, o app combina a biblioteca remota com o cache da conta e os dados do convidado. Entradas de histórico são unidas por ID e ordenadas pela data; playlists com IDs iguais são combinadas e faixas duplicadas são removidas por ID. O histórico é limitado aos 300 itens de reprodução e 100 buscas mais recentes. Depois de sincronizar com sucesso, o cache de convidado é apagado para não reaplicar dados antigos em um login futuro. Se a nuvem falhar, os dados locais continuam acessíveis e é exibido um aviso.

#### Lógica das recomendações personalizadas

As listas inteligentes são calculadas localmente pelo app a partir de buscas concluídas e reproduções do próprio usuário. Não é usado machine learning nem um serviço externo de recomendação:

1. **Tocadas recentemente:** faixas únicas, ordenadas da reprodução mais recente para a mais antiga; até 30 itens.
2. **Suas mais ouvidas:** contagem de reproduções por faixa, em ordem decrescente; em empate, a faixa ouvida mais recentemente vem primeiro. Até 30 itens.
3. **Descobertas das suas buscas:** faixas dos resultados de buscas recentes para antigas, sem repetir IDs; até 30 itens, a partir de um histórico de no máximo 100 buscas.

As listas são recalculadas quando o histórico muda. Os resultados de buscas por faixas e as reproduções feitas pelo player alimentam esse histórico. Em **Minhas listas**, também é possível criar, renomear e excluir playlists próprias, além de adicionar faixas a elas pela busca. Tanto o modo convidado quanto o modo autenticado oferecem esses recursos; a conta permite sincronizar a biblioteca entre sessões/dispositivos.

### Configuração no Spotify Dashboard
1. Acesse https://developer.spotify.com/dashboard/
2. Crie um App ou use existente
3. Em **Redirect URIs**, adicione: `http://localhost:5173/callback`
4. Copie **Client ID** e **Client Secret** para o `.env`

---

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build produção
npm run build

# Preview build
npm run preview

# Testes
npm run test
npm run test:ui
npm run test:coverage

# Lint
npm run lint
```

---

## 🎮 Como Usar

### 1. Busca Básica
- Digite na barra de busca (Home ou página Search)
- Resultados aparecem em tempo real (artistas, tracks, álbuns, playlists)
- Clique em qualquer card para navegar

### 2. Reprodução
- **Deezer (padrão)**: Clique no ícone ▶️ no card → toca preview 30s
- **YouTube**: Clique no ícone do YouTube em uma faixa → o app busca um vídeo incorporável usando a chave `VITE_YOUTUBE_API_KEY` e o reproduz no player IFrame. O player é montado após a seleção do vídeo e sincroniza play/pause, volume, progresso e seek. Se a incorporação for bloqueada, use **Abrir no YouTube**.
- **Spotify**: 
  1. Clique "Conectar Spotify" na navbar
  2. Autorize no Spotify
  3. Volte ao app → botão Spotify aparece nos cards/player
  4. Requer **Spotify Premium** para streaming completo

### 3. Player Unificado
- Fixo no rodapé da tela
- Mostra: capa, título, artista, fonte ativa
- Controles: ▶️⏸️, ⏮️⏭️, volume, progress bar
- Clique na progress bar para expandir (YouTube player / Spotify info)
- Botões de fonte: **Deezer** | **YouTube** | **Spotify**

### 4. Favoritos
- Clique no ♡ nos cards (quando implementado)
- Persistido no localStorage entre sessões

---

## ⚠️ Limitações Conhecidas

| Fonte | Limitação |
|-------|-----------|
| **Deezer** | Apenas 30s preview (limitação da API pública) |
| **YouTube** | Anúncios, restrições de região, vídeos podem ser removidos, sem controle fino de queue |
| **Spotify** | **Requer conta Premium** (Web Playback SDK não funciona no Free), precisa de OAuth |

---

## 📦 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento (porta 5173) |
| `npm run build` | Build de produção otimizado |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Executa ESLint |
| `npm run test` | Executa testes em modo watch |
| `npm run test:run` | Executa testes uma vez |
| `npm run test:ui` | Interface visual dos testes |
| `npm run test:coverage` | Relatório de cobertura |

---

## 🧪 Testes

- **15 testes passando** (3 arquivos de teste)
- Cobertura: components, hooks, services
- Ambiente: **Vitest** + **happy-dom** + **@testing-library/react**

---

## 🔮 Próximos Passos (Roadmap)

### Curto Prazo
- [ ] Implementar botão de favoritos nos cards (UI + hook já existe)
- [ ] Adicionar testes de integração para PlayerContext
- [ ] Melhorar algoritmo de matching (usar MusicBrainz/Last.fm para validação)

### Médio Prazo
- [ ] Suporte a **Last.fm** como fonte adicional
- [ ] **Equalizador** visual no player
- [ ] **Letras sincronizadas** (via Musixmatch/Genius API)
- [ ] **Modo offline** com Service Worker + IndexedDB

### Longo Prazo
- [ ] **PWA** completo (installable, offline-first)
- [ ] **Compartilhamento social** (playlists, tracks)
- [ ] **Recomendações baseadas em ML** (histórico de escuta)
- [ ] **Multi-device sync** (Spotify Connect style)

---

## 📄 Licença

Projeto educacional / demonstração. Não para uso comercial.
APIs utilizadas:
- Deezer API: https://developers.deezer.com/api
- YouTube Data API: https://developers.google.com/youtube/v3
- Spotify Web API: https://developer.spotify.com/documentation/web-api

---

## 👨‍💻 Autor

Desenvolvido como referência de arquitetura React moderna com integração multi-API de música.

**Última atualização**: 2026-10-21
**Versão**: 1.0.0