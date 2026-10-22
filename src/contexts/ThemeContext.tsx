import { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';
import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  theme: Theme;
}

const defaultThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF0000',
      light: '#FF3333',
      dark: '#CC0000',
    },
    secondary: {
      main: '#000000',
      light: '#333333',
      dark: '#000000',
    },
    background: {
      default: '#000000',
      paper: '#1A1A1A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, fontSize: '2.5rem' },
    h2: { fontWeight: 600, fontSize: '2rem' },
    h3: { fontWeight: 600, fontSize: '1.75rem' },
    h4: { fontWeight: 600, fontSize: '1.5rem' },
    h5: { fontWeight: 500, fontSize: '1.25rem' },
    h6: { fontWeight: 500, fontSize: '1rem' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'html, body, #root': { minWidth: 0, width: '100%' },
        body: { margin: 0 },
        'img, video': { maxWidth: '100%' },
        'main .MuiTypography-root': { overflowWrap: 'anywhere' },
        '@media (max-width: 599.95px)': {
          'main .MuiListItem-root': { flexWrap: 'wrap' },
          'main .MuiListItemText-root': { minWidth: 0, flexBasis: 'calc(100% - 56px)' },
          'main .MuiListItem-root:has(.MuiListItemSecondaryAction-root)': {
            display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', gap: '4px', padding: '12px 0',
          },
          'main .MuiListItemSecondaryAction-root': {
            position: 'static', transform: 'none', gridColumn: '1 / -1', justifySelf: 'end', maxWidth: '100%',
          },
          'main .MuiListItemSecondaryAction-root > *': { flexWrap: 'wrap' },
          'main .MuiIconButton-root': { minWidth: 44, minHeight: 44 },
          'main .MuiListItemIcon-root, main .MuiListItemAvatar-root': { minWidth: 40 },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { '@media (max-width: 599.95px)': { margin: '16px', width: 'calc(100% - 32px)', maxHeight: 'calc(100dvh - 32px)' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': { transform: 'scale(1.02)' },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: '8px', textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '16px',
          paddingRight: '16px',
          '@media (min-width: 600px)': { paddingLeft: '24px', paddingRight: '24px' },
        },
      },
    },
  },
};

const lightThemeOptions: ThemeOptions = {
  ...defaultThemeOptions,
  palette: {
    ...defaultThemeOptions.palette,
    mode: 'light',
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
    },
  },
};

const getThemeOptions = (mode: ThemeMode): ThemeOptions => {
  return mode === 'light' ? lightThemeOptions : defaultThemeOptions;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ph-music-theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return 'dark';
  });

  const theme = createTheme(getThemeOptions(mode));

  const toggleTheme = useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, []);

  useEffect(() => {
    localStorage.setItem('ph-music-theme', mode);
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem('ph-music-theme');
      if (!saved) {
        setMode(e.matches ? 'light' : 'dark');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper component to access theme for MuiThemeProvider
export const ThemedApp = ({ children }: { children: (theme: Theme) => React.ReactNode }) => {
  const { theme } = useTheme();
  return <>{children(theme)}</>;
};

export default ThemeContext;
