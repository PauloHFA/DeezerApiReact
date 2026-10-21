import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [] as any;
  }
  unobserve() {}
} as any;

// Mock YouTube Player API
const mockYTPlayer = {
  playVideo: vi.fn(),
  pauseVideo: vi.fn(),
  stopVideo: vi.fn(),
  seekTo: vi.fn(),
  setVolume: vi.fn(),
  getVolume: vi.fn().mockReturnValue(100),
  getDuration: vi.fn().mockReturnValue(0),
  getCurrentTime: vi.fn().mockReturnValue(0),
  getPlayerState: vi.fn().mockReturnValue(-1),
  loadVideoById: vi.fn(),
  cueVideoById: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  destroy: vi.fn(),
};

global.YT = {
  Player: vi.fn().mockImplementation(function() {
    return mockYTPlayer;
  }),
  PlayerState: {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5,
  },
};

// Mock document.getElementsByTagName for YouTube API script injection
const originalGetElementsByTagName = document.getElementsByTagName.bind(document);
document.getElementsByTagName = vi.fn().mockImplementation((tagName: string) => {
  if (tagName === 'script') {
    return [{
      parentNode: {
        insertBefore: vi.fn(),
      },
    }] as any;
  }
  return originalGetElementsByTagName(tagName);
});

// Mock Spotify Web Playback SDK
global.Spotify = {
  Player: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue(true),
    disconnect: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    getCurrentState: vi.fn().mockResolvedValue(null),
    setName: vi.fn(),
    getVolume: vi.fn().mockResolvedValue(1),
    setVolume: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn().mockResolvedValue(undefined),
    resume: vi.fn().mockResolvedValue(undefined),
    togglePlay: vi.fn().mockResolvedValue(undefined),
    seek: vi.fn().mockResolvedValue(undefined),
    previousTrack: vi.fn().mockResolvedValue(undefined),
    nextTrack: vi.fn().mockResolvedValue(undefined),
  })),
};

// Clear localStorage before each test to avoid state leakage
beforeEach(() => {
  localStorage.clear();
});
