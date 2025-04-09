class StateManager {
  constructor() {
    this.observers = new Map();
    this.state = {
      currentTrack: null,
      isPlaying: false,
      volume: 0.5,
      queue: [],
      currentArtist: null,
      currentPlaylist: null,
    };
  }

  // Subscribe to state changes
  subscribe(key, callback) {
    if (!this.observers.has(key)) {
      this.observers.set(key, new Set());
    }
    this.observers.get(key).add(callback);
    return () => this.unsubscribe(key, callback);
  }

  // Unsubscribe from state changes
  unsubscribe(key, callback) {
    if (this.observers.has(key)) {
      this.observers.get(key).delete(callback);
    }
  }

  // Update state and notify observers
  setState(key, value) {
    this.state[key] = value;
    this.notify(key);
  }

  // Get current state
  getState(key) {
    return this.state[key];
  }

  // Notify all observers of a specific state change
  notify(key) {
    if (this.observers.has(key)) {
      this.observers.get(key).forEach(callback => callback(this.state[key]));
    }
  }

  // Player controls
  playTrack(track) {
    this.setState('currentTrack', track);
    this.setState('isPlaying', true);
  }

  pauseTrack() {
    this.setState('isPlaying', false);
  }

  resumeTrack() {
    this.setState('isPlaying', true);
  }

  setVolume(volume) {
    this.setState('volume', Math.max(0, Math.min(1, volume)));
  }

  addToQueue(track) {
    const newQueue = [...this.state.queue, track];
    this.setState('queue', newQueue);
  }

  clearQueue() {
    this.setState('queue', []);
  }

  setCurrentArtist(artist) {
    this.setState('currentArtist', artist);
  }

  setCurrentPlaylist(playlist) {
    this.setState('currentPlaylist', playlist);
  }
}

// Create a singleton instance
const stateManager = new StateManager();
export default stateManager; 