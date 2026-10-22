import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { User } from '@supabase/supabase-js';
import type { Track } from '@/types';
import { getSupabaseClient, isSupabaseConfigured } from '@/services/supabaseClient';

const GUEST_LIBRARY_KEY = 'ph-music-library-guest';
const ACCOUNT_LIBRARY_KEY_PREFIX = 'ph-music-library-user:';
const MAX_PLAY_HISTORY = 300;
const MAX_SEARCH_HISTORY = 100;

export interface PlayHistoryEntry {
  id: string;
  track: Track;
  playedAt: string;
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  tracks: Track[];
  searchedAt: string;
}

export interface CustomPlaylist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: string;
  updatedAt: string;
}

export interface PersonalLibrary {
  playHistory: PlayHistoryEntry[];
  searchHistory: SearchHistoryEntry[];
  playlists: CustomPlaylist[];
}

export interface SmartPlaylist {
  id: 'recently-played' | 'most-played' | 'search-discoveries';
  name: string;
  description: string;
  tracks: Track[];
}

interface AccountContextValue {
  user: User | null;
  authReady: boolean;
  authConfigured: boolean;
  authError: string | null;
  syncError: string | null;
  library: PersonalLibrary;
  smartPlaylists: SmartPlaylist[];
  clearAuthError: () => void;
  clearSyncError: () => void;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  recordTrackPlayed: (track: Track) => void;
  recordSearch: (query: string, tracks: Track[]) => void;
  createPlaylist: (name: string) => string;
  renamePlaylist: (playlistId: string, name: string) => void;
  deletePlaylist: (playlistId: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: number) => void;
}

const emptyLibrary = (): PersonalLibrary => ({
  playHistory: [],
  searchHistory: [],
  playlists: [],
});

const accountLibraryKey = (userId: string) => `${ACCOUNT_LIBRARY_KEY_PREFIX}${userId}`;

const isTrack = (value: unknown): value is Track =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  typeof value.id === 'number' &&
  'title' in value &&
  typeof value.title === 'string' &&
  'artist' in value &&
  typeof value.artist === 'object' &&
  value.artist !== null;

const parseLibrary = (value: unknown): PersonalLibrary => {
  if (!value || typeof value !== 'object') {
    return emptyLibrary();
  }

  const candidate = value as Partial<PersonalLibrary>;
  return {
    playHistory: Array.isArray(candidate.playHistory)
      ? candidate.playHistory.filter(
          (entry): entry is PlayHistoryEntry =>
            typeof entry === 'object' &&
            entry !== null &&
            typeof entry.id === 'string' &&
            typeof entry.playedAt === 'string' &&
            isTrack(entry.track)
        )
      : [],
    searchHistory: Array.isArray(candidate.searchHistory)
      ? candidate.searchHistory.filter(
          (entry): entry is SearchHistoryEntry =>
            typeof entry === 'object' &&
            entry !== null &&
            typeof entry.id === 'string' &&
            typeof entry.query === 'string' &&
            typeof entry.searchedAt === 'string' &&
            Array.isArray(entry.tracks) &&
            entry.tracks.every(isTrack)
        )
      : [],
    playlists: Array.isArray(candidate.playlists)
      ? candidate.playlists.filter(
          (entry): entry is CustomPlaylist =>
            typeof entry === 'object' &&
            entry !== null &&
            typeof entry.id === 'string' &&
            typeof entry.name === 'string' &&
            typeof entry.createdAt === 'string' &&
            typeof entry.updatedAt === 'string' &&
            Array.isArray(entry.tracks) &&
            entry.tracks.every(isTrack)
        )
      : [],
  };
};

const readLibrary = (key: string): PersonalLibrary => {
  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? parseLibrary(JSON.parse(rawValue) as unknown) : emptyLibrary();
  } catch (error) {
    console.error(`Failed to read personal library from ${key}:`, error);
    return emptyLibrary();
  }
};

const mergeLibraries = (...libraries: PersonalLibrary[]): PersonalLibrary => {
  const playHistory = new Map<string, PlayHistoryEntry>();
  const searchHistory = new Map<string, SearchHistoryEntry>();
  const playlists = new Map<string, CustomPlaylist>();

  libraries.forEach((library) => {
    library.playHistory.forEach((entry) => playHistory.set(entry.id, entry));
    library.searchHistory.forEach((entry) => searchHistory.set(entry.id, entry));
    library.playlists.forEach((playlist) => {
      const existing = playlists.get(playlist.id);
      if (!existing) {
        playlists.set(playlist.id, playlist);
        return;
      }

      const tracks = new Map(existing.tracks.map((track) => [track.id, track]));
      playlist.tracks.forEach((track) => tracks.set(track.id, track));
      playlists.set(playlist.id, {
        ...existing,
        ...playlist,
        tracks: Array.from(tracks.values()),
      });
    });
  });

  return {
    playHistory: Array.from(playHistory.values())
      .sort((left, right) => right.playedAt.localeCompare(left.playedAt))
      .slice(0, MAX_PLAY_HISTORY),
    searchHistory: Array.from(searchHistory.values())
      .sort((left, right) => right.searchedAt.localeCompare(left.searchedAt))
      .slice(0, MAX_SEARCH_HISTORY),
    playlists: Array.from(playlists.values()).sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt)
    ),
  };
};

const createSmartPlaylists = (library: PersonalLibrary): SmartPlaylist[] => {
  const sortedPlayHistory = [...library.playHistory].sort((left, right) =>
    right.playedAt.localeCompare(left.playedAt)
  );
  const uniqueTracks = (entries: PlayHistoryEntry[]) => {
    const seen = new Set<number>();
    return entries
      .filter(({ track }) => {
        if (seen.has(track.id)) return false;
        seen.add(track.id);
        return true;
      })
      .map(({ track }) => track)
      .slice(0, 30);
  };

  const playCounts = new Map<number, { track: Track; count: number; lastPlayedAt: string }>();
  library.playHistory.forEach(({ track, playedAt }) => {
    const existing = playCounts.get(track.id);
    playCounts.set(track.id, {
      track,
      count: (existing?.count ?? 0) + 1,
      lastPlayedAt:
        existing && existing.lastPlayedAt > playedAt ? existing.lastPlayedAt : playedAt,
    });
  });

  const searchTracks = library.searchHistory
    .slice()
    .sort((left, right) => right.searchedAt.localeCompare(left.searchedAt))
    .flatMap(({ tracks }) => tracks);
  const seenSearchTracks = new Set<number>();

  return [
    {
      id: 'recently-played',
      name: 'Tocadas recentemente',
      description: 'Faixas que você ouviu por último.',
      tracks: uniqueTracks(sortedPlayHistory),
    },
    {
      id: 'most-played',
      name: 'Suas mais ouvidas',
      description: 'As faixas que você mais reproduziu.',
      tracks: Array.from(playCounts.values())
        .sort(
          (left, right) =>
            right.count - left.count ||
            right.lastPlayedAt.localeCompare(left.lastPlayedAt)
        )
        .slice(0, 30)
        .map(({ track }) => track),
    },
    {
      id: 'search-discoveries',
      name: 'Descobertas das suas buscas',
      description: 'Faixas encontradas nas suas pesquisas recentes.',
      tracks: searchTracks
        .filter((track) => {
          if (seenSearchTracks.has(track.id)) return false;
          seenSearchTracks.add(track.id);
          return true;
        })
        .slice(0, 30),
    },
  ];
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';

export const AccountContext = createContext<AccountContextValue | null>(null);

export const AccountProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [library, setLibrary] = useState<PersonalLibrary>(() =>
    readLibrary(GUEST_LIBRARY_KEY)
  );
  const [hydratedUserId, setHydratedUserId] = useState<string | null>(null);
  const activeUserIdRef = useRef<string | null | undefined>(undefined);

  const hydrateUserLibrary = useCallback(async (userId: string) => {
    const guestLibrary = readLibrary(GUEST_LIBRARY_KEY);
    const localAccountLibrary = readLibrary(accountLibraryKey(userId));
    try {
      const client = await getSupabaseClient();
      if (!client) {
        throw new Error('O cliente Supabase não está disponível.');
      }

      const { data, error } = await client
        .from('user_music_libraries')
        .select('payload')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      const remoteLibrary = parseLibrary(data?.payload);
      const merged = mergeLibraries(remoteLibrary, localAccountLibrary, guestLibrary);
      if (activeUserIdRef.current !== userId) return;

      setLibrary(merged);
      setHydratedUserId(userId);
      setSyncError(null);
    } catch (error) {
      console.error('Failed to load the account music library:', error);
      if (activeUserIdRef.current !== userId) return;

      setLibrary(mergeLibraries(localAccountLibrary, guestLibrary));
      setHydratedUserId(userId);
      setSyncError(
        `Não foi possível sincronizar seus dados com o Supabase: ${getErrorMessage(error)}`
      );
    }
  }, []);

  const applySessionUser = useCallback(
    (nextUser: User | null) => {
      const nextUserId = nextUser?.id ?? null;
      if (activeUserIdRef.current === nextUserId) {
        setUser(nextUser);
        return;
      }

      activeUserIdRef.current = nextUserId;
      setUser(nextUser);
      setAuthError(null);
      setSyncError(null);

      if (!nextUser) {
        setHydratedUserId(null);
        setLibrary(readLibrary(GUEST_LIBRARY_KEY));
        setAuthReady(true);
        return;
      }

      setHydratedUserId(null);
      setLibrary(readLibrary(accountLibraryKey(nextUser.id)));
      void hydrateUserLibrary(nextUser.id);
      setAuthReady(true);
    },
    [hydrateUserLibrary]
  );

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthReady(true);
      return;
    }

    let isActive = true;
    let unsubscribe: (() => void) | null = null;
    const initializeAuth = async () => {
      const client = await getSupabaseClient();
      if (!client || !isActive) return;

      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((_event, session) => {
        if (isActive) applySessionUser(session?.user ?? null);
      });
      unsubscribe = () => subscription.unsubscribe();

      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      if (isActive) applySessionUser(data.session?.user ?? null);
    };

    void initializeAuth().catch((error: unknown) => {
      console.error('Failed to restore the Supabase session:', error);
      if (isActive) {
        setAuthError(`Não foi possível restaurar sua sessão: ${getErrorMessage(error)}`);
        setAuthReady(true);
      }
    });

    return () => {
      isActive = false;
      unsubscribe?.();
    };
  }, [applySessionUser]);

  useEffect(() => {
    try {
      if (!user) {
        window.localStorage.setItem(GUEST_LIBRARY_KEY, JSON.stringify(library));
        return;
      }

      if (hydratedUserId !== user.id) return;

      window.localStorage.setItem(
        accountLibraryKey(user.id),
        JSON.stringify(library)
      );

      if (!isSupabaseConfigured) return;

      const timeoutId = window.setTimeout(() => {
        void (async () => {
          try {
            const client = await getSupabaseClient();
            if (!client || activeUserIdRef.current !== user.id) return;

            const { error } = await client
              .from('user_music_libraries')
              .upsert({
                user_id: user.id,
                payload: library,
                updated_at: new Date().toISOString(),
              });
            if (error) throw error;
            if (activeUserIdRef.current === user.id) {
              window.localStorage.removeItem(GUEST_LIBRARY_KEY);
              setSyncError(null);
            }
          } catch (error) {
            console.error('Failed to save the account music library:', error);
            if (activeUserIdRef.current === user.id) {
              setSyncError(
                `Não foi possível salvar seus dados no Supabase: ${getErrorMessage(error)}`
              );
            }
          }
        })();
      }, 700);

      return () => window.clearTimeout(timeoutId);
    } catch (error) {
      console.error('Failed to persist the personal music library:', error);
      setSyncError(`Não foi possível salvar seus dados neste dispositivo: ${getErrorMessage(error)}`);
    }
  }, [library, user, hydratedUserId]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const client = await getSupabaseClient();
    if (!client) {
      throw new Error('O login ainda não está configurado neste projeto.');
    }
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const client = await getSupabaseClient();
    if (!client) {
      throw new Error('O cadastro ainda não está configurado neste projeto.');
    }
    const { error } = await client.auth.signUp({ email, password });
    if (error) throw error;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const client = await getSupabaseClient();
    if (!client) {
      throw new Error('O login ainda não está configurado neste projeto.');
    }
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/account` },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const client = await getSupabaseClient();
    if (!client) {
      throw new Error('O login ainda não está configurado neste projeto.');
    }
    const { error } = await client.auth.signOut();
    if (error) throw error;
  }, []);

  const recordTrackPlayed = useCallback((track: Track) => {
    const entry: PlayHistoryEntry = {
      id: window.crypto.randomUUID(),
      track,
      playedAt: new Date().toISOString(),
    };
    setLibrary((current) => ({
      ...current,
      playHistory: [entry, ...current.playHistory].slice(0, MAX_PLAY_HISTORY),
    }));
  }, []);

  const recordSearch = useCallback((query: string, tracks: Track[]) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setLibrary((current) => {
      const now = new Date().toISOString();
      const mostRecent = current.searchHistory[0];
      if (
        mostRecent?.query.toLocaleLowerCase() === trimmedQuery.toLocaleLowerCase() &&
        Date.now() - new Date(mostRecent.searchedAt).getTime() < 3000
      ) {
        return {
          ...current,
          searchHistory: [
            { ...mostRecent, tracks: tracks.slice(0, 20), searchedAt: now },
            ...current.searchHistory.slice(1),
          ],
        };
      }

      return {
        ...current,
        searchHistory: [
          {
            id: window.crypto.randomUUID(),
            query: trimmedQuery,
            tracks: tracks.slice(0, 20),
            searchedAt: now,
          },
          ...current.searchHistory,
        ].slice(0, MAX_SEARCH_HISTORY),
      };
    });
  }, []);

  const createPlaylist = useCallback((name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error('Informe um nome para a playlist.');

    const now = new Date().toISOString();
    const playlist: CustomPlaylist = {
      id: window.crypto.randomUUID(),
      name: trimmedName,
      tracks: [],
      createdAt: now,
      updatedAt: now,
    };
    setLibrary((current) => ({
      ...current,
      playlists: [playlist, ...current.playlists],
    }));
    return playlist.id;
  }, []);

  const renamePlaylist = useCallback((playlistId: string, name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error('Informe um nome para a playlist.');

    setLibrary((current) => ({
      ...current,
      playlists: current.playlists.map((playlist) =>
        playlist.id === playlistId
          ? { ...playlist, name: trimmedName, updatedAt: new Date().toISOString() }
          : playlist
      ),
    }));
  }, []);

  const deletePlaylist = useCallback((playlistId: string) => {
    setLibrary((current) => ({
      ...current,
      playlists: current.playlists.filter((playlist) => playlist.id !== playlistId),
    }));
  }, []);

  const addTrackToPlaylist = useCallback((playlistId: string, track: Track) => {
    setLibrary((current) => ({
      ...current,
      playlists: current.playlists.map((playlist) => {
        if (playlist.id !== playlistId) return playlist;
        if (playlist.tracks.some((existingTrack) => existingTrack.id === track.id)) {
          return playlist;
        }
        return {
          ...playlist,
          tracks: [...playlist.tracks, track],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  }, []);

  const removeTrackFromPlaylist = useCallback((playlistId: string, trackId: number) => {
    setLibrary((current) => ({
      ...current,
      playlists: current.playlists.map((playlist) =>
        playlist.id === playlistId
          ? {
              ...playlist,
              tracks: playlist.tracks.filter((track) => track.id !== trackId),
              updatedAt: new Date().toISOString(),
            }
          : playlist
      ),
    }));
  }, []);

  const smartPlaylists = useMemo(() => createSmartPlaylists(library), [library]);

  const value = useMemo<AccountContextValue>(
    () => ({
      user,
      authReady,
      authConfigured: isSupabaseConfigured,
      authError,
      syncError,
      library,
      smartPlaylists,
      clearAuthError: () => setAuthError(null),
      clearSyncError: () => setSyncError(null),
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      recordTrackPlayed,
      recordSearch,
      createPlaylist,
      renamePlaylist,
      deletePlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
    }),
    [
      user,
      authReady,
      authError,
      syncError,
      library,
      smartPlaylists,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      recordTrackPlayed,
      recordSearch,
      createPlaylist,
      renamePlaylist,
      deletePlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
    ]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider.');
  }
  return context;
};
