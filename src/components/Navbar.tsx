import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Tooltip, Drawer, List, ListItemButton, ListItemIcon, ListItemText, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Link as RouterLink } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SpotifyIcon from '@mui/icons-material/MusicNote'; // Using MusicNote as Spotify icon
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useTheme } from '../contexts/ThemeContext';
import { useAccount } from '../contexts/AccountContext';

const Navbar = () => {
  const { mode, toggleTheme, theme } = useTheme();
  const { user } = useAccount();
  const [menuOpen, setMenuOpen] = useState(false);
  const desktopNavigation = useMediaQuery(theme.breakpoints.up('lg'));
  const mobileLinks = [
    { to: '/', label: 'Home', icon: <HomeIcon /> },
    { to: '/search', label: 'Search', icon: <SearchIcon /> },
    { to: '/library', label: 'Minhas listas', icon: <LibraryMusicIcon /> },
    { to: '/account', label: user ? 'Minha conta' : 'Entrar', icon: <AccountCircleIcon /> },
    { to: '/auth/spotify', label: 'Conectar Spotify', icon: <SpotifyIcon /> },
  ];

  return (
    <AppBar position="static" elevation={0} sx={{ background: 'linear-gradient(to right, #000000, #1A1A1A)' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ gap: 1 }}>
          <IconButton aria-label="Abrir menu de navegação" aria-expanded={menuOpen} aria-controls={menuOpen ? 'mobile-navigation' : undefined} onClick={() => setMenuOpen(true)} color="inherit" sx={{ display: { xs: 'inline-flex', lg: 'none' }, minWidth: 44, minHeight: 44 }}>
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: { xs: 0, lg: 2 }, flexGrow: { xs: 1, lg: 0 }, minWidth: 0 }}>
            <MusicNoteIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                fontWeight: 700,
                background: 'linear-gradient(45deg, #FF0000 30%, #FF3333 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              PH Music
            </Typography>
          </Box>
          <Box component="nav" aria-label="Navegação principal" sx={{ flexGrow: 1, display: { xs: 'none', lg: 'flex' }, gap: 2 }}>
            <Button
              color="inherit"
              component={RouterLink}
              to="/"
              startIcon={<HomeIcon />}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                },
              }}
            >
              Home
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/search"
              startIcon={<SearchIcon />}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                },
              }}
            >
              Search
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/library"
              startIcon={<LibraryMusicIcon />}
              sx={{ '&:hover': { backgroundColor: 'rgba(255, 0, 0, 0.1)' } }}
            >
              Minhas listas
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/account"
              startIcon={<AccountCircleIcon />}
              sx={{ '&:hover': { backgroundColor: 'rgba(255, 0, 0, 0.1)' } }}
            >
              {user ? 'Minha conta' : 'Entrar'}
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/auth/spotify"
              startIcon={<SpotifyIcon />}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(29, 185, 84, 0.1)',
                },
                color: '#1DB954',
              }}
            >
              Conectar Spotify
            </Button>
          </Box>
          <Tooltip title={mode === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'}>
            <IconButton aria-label={mode === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'} onClick={toggleTheme} color="inherit" sx={{ ml: 1, minWidth: 44, minHeight: 44 }}>
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </Container>
      <Drawer open={menuOpen && !desktopNavigation} onClose={() => setMenuOpen(false)}>
        <Box component="nav" id="mobile-navigation" aria-label="Navegação no celular" sx={{ width: 'min(300px, 85vw)', pt: 'env(safe-area-inset-top)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
            <Typography variant="h6">PH Music</Typography>
            <IconButton aria-label="Fechar menu" onClick={() => setMenuOpen(false)}><CloseIcon /></IconButton>
          </Box>
          <List>
            {mobileLinks.map(({ to, label, icon }) => (
              <ListItemButton key={to} component={RouterLink} to={to} onClick={() => setMenuOpen(false)} sx={{ minHeight: 52 }}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
