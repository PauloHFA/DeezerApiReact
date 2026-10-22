import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import GoogleIcon from '@mui/icons-material/Google';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAccount } from '@/contexts/AccountContext';

const Account = () => {
  const {
    user,
    authReady,
    authConfigured,
    authError,
    syncError,
    clearAuthError,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  } = useAccount();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setSuccessMessage(null);
    clearAuthError();

    try {
      if (isSignUp) {
        await signUpWithEmail(email.trim(), password);
        setSuccessMessage('Cadastro enviado. Verifique seu e-mail para confirmar a conta, se solicitado.');
      } else {
        await signInWithEmail(email.trim(), password);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível concluir a autenticação.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    setFormError(null);
    clearAuthError();
    try {
      await signInWithGoogle();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível entrar com Google.');
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setSubmitting(true);
    setFormError(null);
    try {
      await signOut();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível sair da conta.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6, pb: 12 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
          background: 'linear-gradient(135deg, #1A1A1A 0%, #000000 100%)',
        }}
      >
        <Stack spacing={3}>
          <Box sx={{ textAlign: 'center' }}>
            <AccountCircleIcon sx={{ color: 'primary.main', fontSize: 54, mb: 1 }} />
            <Typography variant="h4" component="h1" fontWeight={700}>
              {user ? 'Sua conta' : 'Entre no PH Music'}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Entrar é opcional. Você pode continuar ouvindo e criando listas como convidado.
            </Typography>
          </Box>

          {authError && <Alert severity="error">{authError}</Alert>}
          {syncError && <Alert severity="warning">{syncError}</Alert>}
          {formError && <Alert severity="error">{formError}</Alert>}
          {successMessage && <Alert severity="success">{successMessage}</Alert>}

          {!authReady ? (
            <Typography role="status" align="center" color="text.secondary">
              Verificando sessão...
            </Typography>
          ) : user ? (
            <>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Conta conectada
                </Typography>
                <Typography variant="h6" sx={{ overflowWrap: 'anywhere' }}>
                  {user.email || 'Conta Google'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Suas buscas, reproduções e listas serão sincronizadas quando a conexão estiver disponível.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleSignOut}
                disabled={submitting}
              >
                Sair da conta
              </Button>
            </>
          ) : authConfigured ? (
            <>
              <Box component="form" onSubmit={handleEmailSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="E-mail"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Senha"
                    type="password"
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    inputProps={{ minLength: 6 }}
                    required
                    fullWidth
                  />
                  <Button type="submit" variant="contained" disabled={submitting}>
                    {isSignUp ? 'Criar conta' : 'Entrar com e-mail'}
                  </Button>
                </Stack>
              </Box>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleSignIn}
                disabled={submitting}
              >
                Continuar com Google
              </Button>
              <Button
                color="inherit"
                onClick={() => {
                  setIsSignUp((current) => !current);
                  setFormError(null);
                  setSuccessMessage(null);
                }}
              >
                {isSignUp ? 'Já tem uma conta? Entrar' : 'Ainda não tem conta? Criar conta'}
              </Button>
            </>
          ) : (
            <Alert severity="info">
              O login opcional ainda precisa ser configurado. Defina
              {' '}<code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code>
              {' '}no arquivo local <code>.env</code> e configure o banco conforme o README.
              Enquanto isso, o app continua disponível como convidado.
            </Alert>
          )}

          <Button component={RouterLink} to="/library" color="inherit">
            Ir para minhas listas
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Account;
