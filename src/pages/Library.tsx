import { useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SearchIcon from '@mui/icons-material/Search';
import { Link as RouterLink } from 'react-router-dom';
import { useAccount } from '@/contexts/AccountContext';
import type { CustomPlaylist, SmartPlaylist } from '@/contexts/AccountContext';
import { usePlayer } from '@/hooks/usePlayer';
import { useNotification } from '@/hooks/useNotification';
import { fetchYoutubeVideoData } from '@/services/youtubeApi';
import type { Track } from '@/types';

const Library = () => {
  const {
    authConfigured,
    user,
    library,
    smartPlaylists,
    syncError,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
    removeTrackFromPlaylist,
  } = useAccount();
  const { playPreview, playYoutube } = usePlayer();
  const { info, error: notifyError, success } = useNotification();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<CustomPlaylist | null>(null);
  const [playlistName, setPlaylistName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<CustomPlaylist | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedSmartPlaylist = smartPlaylists.find(
    (playlist) => `smart:${playlist.id}` === selectedListId
  );
  const selectedCustomPlaylist = library.playlists.find(
    (playlist) => `custom:${playlist.id}` === selectedListId
  );
  const selectedList: SmartPlaylist | CustomPlaylist | undefined =
    selectedSmartPlaylist ?? selectedCustomPlaylist;
  const selectedIsCustom = Boolean(selectedCustomPlaylist);
  const selectedDescription = selectedSmartPlaylist?.description;

  const sortedCustomPlaylists = useMemo(
    () => [...library.playlists].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
    [library.playlists]
  );

  const openCreateDialog = () => {
    setEditingPlaylist(null);
    setPlaylistName('');
    setFormError(null);
    setEditorOpen(true);
  };

  const openEditDialog = (playlist: CustomPlaylist) => {
    setEditingPlaylist(playlist);
    setPlaylistName(playlist.name);
    setFormError(null);
    setEditorOpen(true);
  };

  const savePlaylist = () => {
    try {
      if (editingPlaylist) {
        renamePlaylist(editingPlaylist.id, playlistName);
      } else {
        createPlaylist(playlistName);
      }
      setEditorOpen(false);
      setFormError(null);
      success(editingPlaylist ? 'Playlist atualizada.' : 'Playlist criada.');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível salvar a playlist.');
    }
  };

  const confirmDeletePlaylist = () => {
    if (!deleteTarget) return;
    deletePlaylist(deleteTarget.id);
    if (selectedListId === `custom:${deleteTarget.id}`) {
      setSelectedListId(null);
    }
    setDeleteTarget(null);
    success('Playlist removida.');
  };

  const handlePlayTrack = async (track: Track) => {
    if (track.preview) {
      playPreview(track);
      return;
    }

    const query = `${track.title} ${track.artist.name}`;
    info('Buscando uma versão para reprodução no YouTube...');
    try {
      const video = await fetchYoutubeVideoData(query);
      if (video) {
        playYoutube(track, video.videoId, video.thumbnailUrl);
        return;
      }
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
      notifyError('Não foi possível encontrar o vídeo automaticamente. Abrindo os resultados do YouTube.');
    } catch (error) {
      console.error('Failed to find a YouTube version of the track:', error);
      notifyError('Falha ao buscar a faixa no YouTube.');
    }
  };

  const renderPlaylistCard = (
    playlist: SmartPlaylist | CustomPlaylist,
    id: string,
    description: string
  ) => (
    <Card
      key={id}
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, #1A1A1A 0%, #080808 100%)',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 1 }}>
        <LibraryMusicIcon sx={{ color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h6" component="h3" fontWeight={700}>
          {playlist.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
          {description}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {playlist.tracks.length} {playlist.tracks.length === 1 ? 'faixa' : 'faixas'}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => setSelectedListId(id)}
          disabled={playlist.tracks.length === 0}
        >
          Abrir lista
        </Button>
      </CardContent>
    </Card>
  );

  if (selectedList) {
    return (
      <Container maxWidth="md" sx={{ py: 4, pb: 12 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => setSelectedListId(null)} sx={{ mb: 2 }}>
          Todas as listas
        </Button>
        <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} sx={{ mb: 1 }}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight={700}>
                {selectedList.name}
              </Typography>
              {selectedDescription && (
                <Typography color="text.secondary">{selectedDescription}</Typography>
              )}
            </Box>
            {selectedCustomPlaylist && (
              <Stack direction="row">
                <Tooltip title="Renomear playlist">
                  <IconButton onClick={() => openEditDialog(selectedCustomPlaylist)} aria-label="Renomear playlist">
                    <EditOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir playlist">
                  <IconButton
                    onClick={() => setDeleteTarget(selectedCustomPlaylist)}
                    aria-label="Excluir playlist"
                    color="error"
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Stack>
          <Divider sx={{ my: 2 }} />
          {selectedList.tracks.length ? (
            <List disablePadding>
              {selectedList.tracks.map((track, index) => (
                <ListItem
                  key={`${track.id}-${index}`}
                  divider={index < selectedList.tracks.length - 1}
                  secondaryAction={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Tooltip title="Reproduzir">
                        <IconButton onClick={() => void handlePlayTrack(track)} aria-label={`Reproduzir ${track.title}`}>
                          <PlayArrowIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                      {selectedCustomPlaylist && (
                        <Tooltip title="Remover da playlist">
                          <IconButton
                            onClick={() => removeTrackFromPlaylist(selectedCustomPlaylist.id, track.id)}
                            aria-label={`Remover ${track.title}`}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={track.album?.cover_small || track.album?.cover_medium}>
                      <LibraryMusicIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={track.title}
                    secondary={track.artist?.name || 'Artista desconhecido'}
                    primaryTypographyProps={{ noWrap: true }}
                    secondaryTypographyProps={{ noWrap: true }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Stack spacing={2} alignItems="center" sx={{ py: 5, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {selectedIsCustom
                  ? 'Esta playlist ainda não tem faixas.'
                  : 'Ainda não há faixas para esta lista.'}
              </Typography>
              {selectedIsCustom && (
                <Button component={RouterLink} to="/search" startIcon={<SearchIcon />}>
                  Buscar faixas para adicionar
                </Button>
              )}
            </Stack>
          )}
        </Paper>

        <PlaylistEditorDialog
          open={editorOpen}
          editing={editingPlaylist}
          name={playlistName}
          error={formError}
          onNameChange={setPlaylistName}
          onClose={() => setEditorOpen(false)}
          onSave={savePlaylist}
        />
        <DeletePlaylistDialog
          playlist={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDeletePlaylist}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, pb: 12 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        gap={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h3" component="h1" fontWeight={800}>
            Suas listas
          </Typography>
          <Typography color="text.secondary">
            Descobertas, reproduções recentes e playlists que você cria.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
          Criar playlist
        </Button>
      </Stack>

      {!authConfigured && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Você está usando o modo convidado. Suas listas ficam salvas neste dispositivo; entrar é opcional.
        </Alert>
      )}
      {user && (
        <Alert severity={syncError ? 'warning' : 'success'} sx={{ mb: 3 }}>
          {syncError || `Biblioteca conectada à conta ${user.email || ''}.`}
        </Alert>
      )}

      <Typography variant="h5" component="h2" fontWeight={700} sx={{ mb: 2 }}>
        Feitas para você
      </Typography>
      {library.playHistory.length === 0 && library.searchHistory.length === 0 ? (
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Typography color="text.secondary">
            Suas listas inteligentes aparecem aqui depois que você buscar ou reproduzir algumas faixas.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2} sx={{ mb: 5 }}>
          {smartPlaylists.map((playlist) => (
            <Grid key={playlist.id} size={{ xs: 12, sm: 6, md: 4 }}>
              {renderPlaylistCard(playlist, `smart:${playlist.id}`, playlist.description)}
            </Grid>
          ))}
        </Grid>
      )}

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" component="h2" fontWeight={700}>
          Suas playlists
        </Typography>
        <Button component={RouterLink} to="/search" startIcon={<SearchIcon />}>
          Buscar faixas
        </Button>
      </Stack>
      {sortedCustomPlaylists.length ? (
        <Grid container spacing={2}>
          {sortedCustomPlaylists.map((playlist) => (
            <Grid key={playlist.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Box sx={{ position: 'relative' }}>
                {renderPlaylistCard(
                  playlist,
                  `custom:${playlist.id}`,
                  `Criada em ${new Date(playlist.createdAt).toLocaleDateString()}`
                )}
                <Stack
                  direction="row"
                  sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'background.paper', borderRadius: 2 }}
                >
                  <Tooltip title="Renomear playlist">
                    <IconButton
                      size="small"
                      onClick={() => openEditDialog(playlist)}
                      aria-label={`Renomear ${playlist.name}`}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir playlist">
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(playlist)}
                      aria-label={`Excluir ${playlist.name}`}
                      color="error"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography color="text.secondary">
            Você ainda não criou uma playlist. Crie uma e adicione faixas pelos resultados da busca.
          </Typography>
        </Paper>
      )}

      <PlaylistEditorDialog
        open={editorOpen}
        editing={editingPlaylist}
        name={playlistName}
        error={formError}
        onNameChange={setPlaylistName}
        onClose={() => setEditorOpen(false)}
        onSave={savePlaylist}
      />
      <DeletePlaylistDialog
        playlist={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeletePlaylist}
      />
    </Container>
  );
};

interface PlaylistEditorDialogProps {
  open: boolean;
  editing: CustomPlaylist | null;
  name: string;
  error: string | null;
  onNameChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

const PlaylistEditorDialog = ({
  open,
  editing,
  name,
  error,
  onNameChange,
  onClose,
  onSave,
}: PlaylistEditorDialogProps) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
    <DialogTitle>{editing ? 'Renomear playlist' : 'Criar playlist'}</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        label="Nome da playlist"
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onSave();
        }}
        error={Boolean(error)}
        helperText={error}
        fullWidth
        sx={{ mt: 1 }}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="inherit">Cancelar</Button>
      <Button onClick={onSave} variant="contained">{editing ? 'Salvar' : 'Criar'}</Button>
    </DialogActions>
  </Dialog>
);

interface DeletePlaylistDialogProps {
  playlist: CustomPlaylist | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeletePlaylistDialog = ({ playlist, onClose, onConfirm }: DeletePlaylistDialogProps) => (
  <Dialog open={Boolean(playlist)} onClose={onClose}>
    <DialogTitle>Excluir playlist?</DialogTitle>
    <DialogContent>
      <Typography>
        A playlist “{playlist?.name}” e suas faixas salvas serão removidas.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="inherit">Cancelar</Button>
      <Button onClick={onConfirm} color="error" variant="contained">Excluir</Button>
    </DialogActions>
  </Dialog>
);

export default Library;
