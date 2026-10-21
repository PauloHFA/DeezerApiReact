# Documentação de Testes - PH Music

## 📋 Visão Geral

Este documento descreve a estratégia de testes, estrutura atual, cobertura e como executar/expandir os testes do projeto PH Music.

---

## 🛠️ Stack de Testes

| Ferramenta | Versão | Propósito |
|------------|--------|-----------|
| **Vitest** | 4.1.3 | Test runner rápido, compatível com Vite |
| **@testing-library/react** | 16.3.2 | Renderização e queries de componentes React |
| **@testing-library/jest-dom** | 6.9.1 | Matchers customizados para DOM |
| **@testing-library/user-event** | 14.6.1 | Simulação de interações do usuário |
| **happy-dom** | 20.8.9 | Ambiente DOM leve para Node.js |
| **vi (Vitest)** | Built-in | Mocking, spies, fake timers |

---

## 📁 Estrutura de Testes

```
src/
├── test/
│   └── setup.ts              # Configuração global (matchMedia, IntersectionObserver mocks)
├── components/
│   └── __tests__/
│       └── CardComponents.test.tsx  # Testes dos cards (Track, Artist, Album, Playlist)
└── hooks/
    └── __tests__/
        ├── useDebounce.test.tsx     # Testes do hook useDebounce
        └── useQuery.test.tsx        # Testes do hook useQuery
```

---

## 📊 Cobertura Atual

### Testes Existentes: **15 testes passando** (3 arquivos)

| Arquivo | Testes | Cobertura |
|---------|--------|-----------|
| `CardComponents.test.tsx` | 6 | TrackCard, ArtistCard, AlbumCard, PlaylistCard |
| `useDebounce.test.tsx` | 3 | Valor inicial, debounce, reset timer |
| `useQuery.test.tsx` | 6 | Inicialização, fetch, erro, cache, retry, enabled flag |

### Executar Testes

```bash
# Modo watch (desenvolvimento)
npm run test

# Execução única (CI/CD)
npm run test:run

# Interface visual
npm run test:ui

# Cobertura de código
npm run test:coverage
```

---

## 🧪 Padrões de Teste Utilizados

### 1. **Render Hook** (para hooks customizados)
```typescript
import { renderHook, act, waitFor } from '@testing-library/react';

const { result, rerender } = renderHook(
  ({ value, delay }) => useDebounce(value, delay),
  { initialProps: { value: 'initial', delay: 500 } }
);
```

### 2. **Fake Timers** (para debounce/throttle)
```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// No teste:
act(() => {
  vi.advanceTimersByTime(500);
});
```

### 3. **Component Rendering** (para componentes UI)
```typescript
import { render, screen } from '@testing-library/react';

render(<TrackCard track={mockTrack} isPlaying={false} onPlay={vi.fn()} />);

expect(screen.getByText('Test Song')).toBeInTheDocument();
```

### 4. **Event Simulation** (para interações)
```typescript
const onPlay = vi.fn();
const { container } = render(<TrackCard ... onPlay={onPlay} />);

const buttons = container.querySelectorAll('button');
buttons[0].click();
expect(onPlay).toHaveBeenCalledWith(mockTrack);
```

### 5. **Async Wait** (para operações assíncronas)
```typescript
await waitFor(() => {
  expect(result.current.loading).toBe(false);
});
```

---

## 📝 Casos de Teste por Categoria

### Hooks

#### `useDebounce` (3 testes)
- ✅ Retorna valor inicial imediatamente
- ✅ Debounce de mudanças de valor (500ms)
- ✅ Reset do timer em mudança rápida de valor

#### `useQuery` (6 testes)
- ✅ Inicialização com data=null, loading=true
- ✅ Fetch de dados e atualização de estado
- ✅ Tratamento de erros
- ✅ Cache de dados (cacheTime)
- ✅ Retry manual
- ✅ Flag `enabled` para desabilitar fetch

### Componentes

#### `CardComponents` (6 testes)
- ✅ TrackCard: renderiza info + chama onPlay
- ✅ ArtistCard: renderiza info + chama onClick
- ✅ AlbumCard: renderiza info + ano
- ✅ PlaylistCard: renderiza info + contagem de tracks

---

## 🎯 Testes Recomendados (Próximos Passos)

### Prioridade Alta

#### 1. **PlayerContext** - Crítico
```typescript
// src/contexts/__tests__/PlayerContext.test.tsx
describe('PlayerContext', () => {
  it('should provide default values when not wrapped in Provider');
  it('should play/pause Deezer preview');
  it('should switch playback source (deezer/youtube/spotify)');
  it('should manage queue (add/remove/clear/next)');
  it('should control volume (0-1)');
  it('should seek to position');
  it('should match current track (YouTube/Spotify)');
});
```

#### 2. **NotificationContext** - Alto
```typescript
// src/contexts/__tests__/NotificationContext.test.tsx
describe('NotificationContext', () => {
  it('should add/remove notifications');
  it('should auto-remove after duration');
  it('should provide success/error/warning/info helpers');
});
```

#### 3. **usePlayer Hook** - Alto
```typescript
// src/hooks/__tests__/usePlayer.test.tsx
describe('usePlayer', () => {
  it('throws error when used outside Provider');
  it('returns all state and actions');
});
```

#### 4. **useFavorites Hook** - Alto
```typescript
// src/hooks/__tests__/useFavorites.test.tsx
describe('useFavorites', () => {
  it('adds/removes favorites by type');
  it('checks if item is favorite');
  it('toggles favorite state');
  it('persists to localStorage');
});
```

#### 5. **useLocalStorage Hook** - Alto
```typescript
// src/hooks/__tests__/useLocalStorage.test.tsx
describe('useLocalStorage', () => {
  it('reads initial value from localStorage');
  it('writes value to localStorage');
  it('handles JSON parse errors');
  it('supports functional updates');
});
```

### Prioridade Média

#### 6. **Services** - Integração
```typescript
// src/services/__tests__/deezerApi.test.ts
describe('deezerApi', () => {
  it('searchArtists returns Artist[]');
  it('getArtist returns Artist');
  it('getArtistAlbums returns Album[]');
  it('getTrackPreview returns string | null');
});

// src/services/__tests__/youtubePlayer.test.ts
describe('youtubePlayerService', () => {
  it('loads YouTube IFrame API');
  it('creates player with videoId');
  it('controls playback (play/pause/stop/seek/volume)');
  it('emits state change events');
  it('destroys player on cleanup');
});

// src/services/__tests__/spotifyApi.test.ts
describe('spotifyService', () => {
  it('generates PKCE code verifier/challenge');
  it('builds auth URL with correct params');
  it('exchanges code for tokens');
  it('refreshes access token');
  it('makes authenticated API requests');
});

// src/services/__tests__/trackMatching.test.ts
describe('trackMatchingService', () => {
  it('matches YouTube video by query');
  it('matches Spotify track by artist+title');
  it('calculates match confidence (high/medium/low)');
  it('caches results');
});
```

#### 7. **Pages** - Integração
```typescript
// src/pages/__tests__/Home.test.tsx
describe('Home', () => {
  it('loads featured artists, top tracks, playlists');
  it('handles loading/error states');
  it('navigates to artist/album/playlist pages');
});

// src/pages/__tests__/Search.test.tsx
describe('Search', () => {
  it('debounces search query (500ms)');
  it('displays results by category');
  it('handles empty results');
  it('previews tracks via Deezer/YouTube');
});
```

### Prioridade Baixa

#### 8. **E2E/Integration** - Playwright/Cypress
```typescript
// e2e/player.spec.ts
test('full playback flow: search -> play preview -> switch to YouTube -> switch to Spotify');
test('queue management: add tracks -> play next -> clear queue');
test('Spotify auth flow: login -> callback -> play track');
```

#### 9. **Visual Regression** - Chromatic/Storybook
```typescript
// stories/Player.stories.tsx
// stories/CardComponents.stories.tsx
```

---

## 📈 Metas de Cobertura

| Métrica | Atual | Meta |
|---------|-------|------|
| **Statements** | ~35% | 80% |
| **Branches** | ~25% | 75% |
| **Functions** | ~30% | 80% |
| **Lines** | ~35% | 80% |

---

## 🔧 Configuração do Vitest

### `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
    },
  },
});
```

---

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        if: github.event_name == 'push'
```

---

## 📚 Boas Práticas

### 1. **Nomenclatura**
- Arquivos: `*.test.tsx` (componentes) / `*.test.ts` (utils/services)
- Describe: nome do módulo/função
- It: comportamento esperado em português/inglês consistente

### 2. **Isolamento**
- Cada teste independente
- `beforeEach`/`afterEach` para limpeza
- `vi.clearAllMocks()` entre testes

### 3. **Mocks Externos**
- APIs externas sempre mockadas
- `vi.fn()` para funções
- `vi.mock()` para módulos

### 4. **Async Testing**
- `waitFor` para assertions assíncronas
- `act()` para updates de estado
- `fakeTimers` para timeouts/intervals

### 5. **Test Data**
- Factories/fixtures para dados de teste
- TypeScript types para mock data
- Dados realistas (não "foo/bar")

---

## 🐛 Debugging Tests

### VS Code Launch Config
```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest",
  "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
  "args": ["run", "--reporter=verbose"],
  "console": "integratedTerminal"
}
```

### Logs Úteis
```typescript
// No teste
console.log('Result:', result.current);
// Ou
screen.debug(); // Pretty DOM output
```

---

## 📅 Checklist de Revisão de PR

- [ ] Novos componentes têm testes básicos (render + props)
- [ ] Novos hooks têm testes de comportamento
- [ ] Novos services têm testes de integração (mocked)
- [ ] Testes passam localmente (`npm run test:run`)
- [ ] Cobertura não diminuiu significativamente
- [ ] Sem `console.log` esquecido nos testes
- [ ] Mocks limpos corretamente (`afterEach`)

---

## 📄 Referências

- [Vitest Guide](https://vitest.dev/guide/)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom#custom-matchers)
- [User Event](https://testing-library.com/docs/user-event/intro/)

---

**Última atualização**: 2026-10-21  
**Versão**: 1.0.0  
**Autor**: Documentação gerada automaticamente baseada no estado atual do projeto