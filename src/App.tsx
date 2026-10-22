import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Suspense, lazy } from 'react';
import { PlayerProvider } from './contexts/PlayerContext';
import { AccountProvider } from './contexts/AccountContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider, ThemedApp } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationContainer from './components/NotificationContainer';
import Navbar from './components/Navbar';
import Player from './components/Player';
import { Container, CircularProgress, Box } from '@mui/material';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Artist = lazy(() => import('./pages/Artist'));
const Search = lazy(() => import('./pages/Search'));
const Album = lazy(() => import('./pages/Album'));
const Playlist = lazy(() => import('./pages/Playlist'));
const SpotifyLogin = lazy(() => import('./pages/SpotifyLogin'));
const SpotifyCallback = lazy(() => import('./pages/SpotifyCallback'));
const Account = lazy(() => import('./pages/Account'));
const Library = lazy(() => import('./pages/Library'));

function App() {
  return (
    <ThemeProvider>
      <ThemedApp>
        {(theme) => (
          <MuiThemeProvider theme={theme}>
            <CssBaseline />
            <ErrorBoundary>
              <NotificationProvider>
                <NotificationContainer />
                <Router>
                  <AccountProvider>
                    <PlayerProvider>
                      <Navbar />
                      <Container maxWidth={false} disableGutters>
                        <Suspense fallback={
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                            <CircularProgress size={60} sx={{ color: 'primary.main' }} />
                          </Box>
                        }>
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/artist/:id" element={<Artist />} />
                            <Route path="/album/:id" element={<Album />} />
                            <Route path="/playlist/:id" element={<Playlist />} />
                            <Route path="/search" element={<Search />} />
                            <Route path="/library" element={<Library />} />
                            <Route path="/account" element={<Account />} />
                            <Route path="/auth/spotify" element={<SpotifyLogin />} />
                            <Route path="/callback" element={<SpotifyCallback />} />
                          </Routes>
                        </Suspense>
                      </Container>
                      <Player />
                    </PlayerProvider>
                  </AccountProvider>
                </Router>
              </NotificationProvider>
            </ErrorBoundary>
          </MuiThemeProvider>
        )}
      </ThemedApp>
    </ThemeProvider>
  );
}

export default App;
