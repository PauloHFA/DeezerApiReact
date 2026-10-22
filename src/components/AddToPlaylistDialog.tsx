import { useState } from 'react';
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { useAccount } from '@/contexts/AccountContext';
import { useNotification } from '@/hooks/useNotification';
import type { Track } from '@/types';

interface AddToPlaylistDialogProps {
  open: boolean;
  track: Track | null;
  onClose: () => void;
}

const AddToPlaylistDialog = ({ open, track, onClose }: AddToPlaylistDialogProps) => {
  const { library, createPlaylist, addTrackToPlaylist } = useAccount();
  const { error, success } = useNotification();
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleClose = () => {
    setNewPlaylistName('');
    onClose();
  };

  const handleAddToPlaylist = (playlistId: string) => {
    if (!track) return;

    try {
      addTrackToPlaylist(playlistId, track);
      success('Faixa adicionada à playlist.');
      handleClose();
    } catch (caughtError) {
      error(caughtError instanceof Error ? caughtError.message : 'Não foi possível adicionar a faixa.');
    }
  };

  const handleCreatePlaylist = () => {
    if (!track) return;

    try {
      const playlistId = createPlaylist(newPlaylistName);
      addTrackToPlaylist(playlistId, track);
      success('Playlist criada e faixa adicionada.');
      handleClose();
    } catch (caughtError) {
      error(caughtError instanceof Error ? caughtError.message : 'Não foi possível criar a playlist.');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Adicionar à playlist</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {track ? `${track.title} — ${track.artist.name}` : ''}
          </Typography>
          {library.playlists.length > 0 ? (
            <Grid container spacing={1.5}>
              {library.playlists.map((playlist) => {
                const alreadyAdded = Boolean(track && playlist.tracks.some(({ id }) => id === track.id));

                return (
                  <Grid key={playlist.id} size={{ xs: 12, sm: 6 }}>
                    <Card variant="outlined">
                      <CardActionArea
                        onClick={() => handleAddToPlaylist(playlist.id)}
                        disabled={alreadyAdded}
                        aria-label={`${alreadyAdded ? 'Faixa já adicionada à' : 'Adicionar à'} playlist ${playlist.name}`}
                        sx={{ height: '100%' }}
                      >
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <LibraryMusicIcon color={alreadyAdded ? 'disabled' : 'primary'} />
                          <Stack sx={{ minWidth: 0, flexGrow: 1 }}>
                            <Typography variant="subtitle2" noWrap>{playlist.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {playlist.tracks.length} {playlist.tracks.length === 1 ? 'faixa' : 'faixas'}
                            </Typography>
                          </Stack>
                          {alreadyAdded ? <CheckIcon color="success" fontSize="small" /> : <PlaylistAddIcon />}
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Você ainda não tem playlists. Crie uma para salvar esta faixa.
            </Typography>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              label="Nome da nova playlist"
              value={newPlaylistName}
              onChange={(event) => setNewPlaylistName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && newPlaylistName.trim()) {
                  event.preventDefault();
                  handleCreatePlaylist();
                }
              }}
              fullWidth
              size="small"
            />
            <Button
              onClick={handleCreatePlaylist}
              variant="contained"
              startIcon={<AddIcon />}
              disabled={!newPlaylistName.trim() || !track}
              sx={{ flexShrink: 0 }}
            >
              Criar e adicionar
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default AddToPlaylistDialog;
