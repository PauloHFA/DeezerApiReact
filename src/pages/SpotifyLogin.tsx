import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { spotifyService } from '../services/spotifyApi';

const SpotifyLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const initiateAuth = async () => {
      try {
        const authUrl = await spotifyService.getAuthUrl();
        window.location.href = authUrl;
      } catch (error) {
        console.error('Failed to initiate Spotify auth:', error);
        navigate('/');
      }
    };

    initiateAuth();
  }, [navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎵</div>
        <h2>Redirecionando para Spotify...</h2>
        <p style={{ color: '#888' }}>Aguarde enquanto iniciamos a autenticação</p>
      </div>
    </div>
  );
};

export default SpotifyLogin;