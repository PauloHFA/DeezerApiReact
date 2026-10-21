import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material/styles';
import { Suspense, lazy } from 'react';
import { PlayerProvider } from './contexts/PlayerContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
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

function App() {
  return (
    <ThemeProvider>
      {({ theme }) => (
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <ErrorBoundary>
            <NotificationProvider>
              <NotificationContainer />
              <Router>
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
                                          <Route path="/auth/spotify" element={<SpotifyLogin />} />
                                          <Route path="/callback" element={<SpotifyCallback />} />
                                        </Routes>
                                      </Suspense>
                                    </Container>
                                    <Player />
                </PlayerProvider>
              </Router>
            </NotificationProvider>
          </ErrorBoundary>
        </MuiThemeProvider>
      )}
    </ThemeProvider>
  );
}

export default App;
