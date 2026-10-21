import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Alert,
  Container,
  Paper,
} from '@mui/material';
import { spotifyService } from '../services/spotifyApi';
import { useNotification } from '../hooks/useNotification';

const SpotifyCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success, error: notifyError, info } = useNotification();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processando autenticação...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`Erro na autenticação: ${error}`);
        notifyError(`Erro no Spotify: ${error}`);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setMessage('Parâmetros de autenticação inválidos');
        notifyError('Parâmetros de autenticação inválidos');
        return;
      }

      try {
        await spotifyService.handleCallback(code, state);
        setStatus('success');
        setMessage('Autenticação no Spotify realizada com sucesso!');
        success('Conectado ao Spotify!');
        
        // Redirect back to home or previous page after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (err) {
        console.error('Spotify callback error:', err);
        setStatus('error');
        setMessage(`Falha na autenticação: ${(err as Error).message}`);
        notifyError(`Falha na autenticação: ${(err as Error).message}`);
      }
    };

    handleCallback();
  }, [searchParams, navigate, success, notifyError]);

  if (status === 'loading') {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 3 }}>
          <CircularProgress size={60} color="success" />
          <Typography variant="h5" component="h2">
            Conectando ao Spotify...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Aguarde enquanto processamos sua autenticação
          </Typography>
        </Box>
      </Container>
    );
  }

  if (status === 'success') {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', background: 'linear-gradient(to right, #1A1A1A, #000000)' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <Typography variant="h5" color="success.main" gutterBottom>
              ✓ Conectado com sucesso!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {message}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Redirecionando para a página inicial...
            </Typography>
            <Button
              variant="contained"
              color="success"
              onClick={() => navigate('/')}
              startIcon={<Typography variant="caption">✓</Typography>}
            >
              Ir para o Início
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', background: 'linear-gradient(to right, #1A1A1A, #000000)' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>Erro na autenticação:</strong> {message}
        </Alert>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              // Try again
              window.location.href = '/auth/spotify';
            }}
          >
            Tentar Novamente
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
          >
            Voltar ao Início
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SpotifyCallback;