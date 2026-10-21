import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SpotifyIcon from '@mui/icons-material/MusicNote'; // Using MusicNote as Spotify icon
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const { mode, toggleTheme } = useTheme();

  return (
    <AppBar position="static" elevation={0} sx={{ background: 'linear-gradient(to right, #000000, #1A1A1A)' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
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
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
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
            <IconButton onClick={toggleTheme} color="inherit" sx={{ ml: 1 }}>
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;