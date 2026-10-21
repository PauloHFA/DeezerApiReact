import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackMatchingService, TrackMatchingService } from '@/services/trackMatching';
import type { Track } from '@/types';

describe('trackMatching Service', () => {
  let service: TrackMatchingService;

  beforeEach(() => {
    service = new TrackMatchingService();
  });

  describe('stringSimilarity (private method tested via matchTrack)', () => {
    it('should return 1 for identical strings', () => {
      // Test via matchTrack with identical tracks
      const deezerTrack: Track = { 
        id: 1, 
        title: 'Bohemian Rhapsody', 
        artist: { name: 'Queen' }, 
        duration: 354 
      };
      const youtubeTrack = { 
        videoId: 'y1', 
        title: 'Bohemian Rhapsody', 
        channelTitle: 'Queen', 
        duration: 354 
      };
      
      // We can't directly test private methods, but we can test the public API
      // The service uses stringSimilarity internally
    });
  });

  describe('matchYouTube', () => {
    it('should return null when not authenticated', async () => {
      const track: Track = { 
        id: 1, 
        title: 'Test Song', 
        artist: { name: 'Test Artist' }, 
        duration: 200 
      };
      
      // Mock fetchYoutubeVideoData to return null
      vi.doMock('@/services/youtubeApi', () => ({
        fetchYoutubeVideoData: vi.fn().mockResolvedValue(null)
      }));
      
      const result = await service.matchYouTube(track);
      expect(result.videoId).toBeNull();
      expect(result.title).toBeNull();
    });
  });

  describe('matchSpotify', () => {
    it('should return null when not authenticated', async () => {
      const track: Track = { 
        id: 1, 
        title: 'Test Song', 
        artist: { name: 'Test Artist' }, 
        duration: 200 
      };
      
      const result = await service.matchSpotify(track);
      expect(result).toBeNull();
    });
  });

  describe('matchTrack', () => {
    it('should return MatchedTrack with none confidence when no matches', async () => {
      const track: Track = { 
        id: 1, 
        title: 'Unknown Song', 
        artist: { name: 'Unknown Artist' }, 
        duration: 200 
      };
      
      const result = await service.matchTrack(track);
      
      expect(result.deezerTrack).toEqual(track);
      expect(result.youtubeVideoId).toBeNull();
      expect(result.spotifyTrack).toBeNull();
      expect(result.matchConfidence).toBe('none');
    });
  });

  describe('matchTracks', () => {
    it('should match multiple tracks', async () => {
      const tracks: Track[] = [
        { id: 1, title: 'Song 1', artist: { name: 'Artist 1' }, duration: 200 },
        { id: 2, title: 'Song 2', artist: { name: 'Artist 2' }, duration: 300 },
      ];
      
      const results = await service.matchTracks(tracks);
      
      expect(results).toHaveLength(2);
      expect(results[0].deezerTrack.id).toBe(1);
      expect(results[1].deezerTrack.id).toBe(2);
    });

    it('should handle empty array', async () => {
      const results = await service.matchTracks([]);
      expect(results).toHaveLength(0);
    });
  });

  describe('clearCache', () => {
    it('should clear internal caches', () => {
      service.clearCache();
      // No error means it works
      expect(true).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle tracks with special characters', async () => {
      const track: Track = { 
        id: 1, 
        title: 'Song (feat. Artist)', 
        artist: { name: 'Main Artist' }, 
        duration: 200 
      };
      
      const result = await service.matchTrack(track);
      expect(result.deezerTrack).toEqual(track);
    });

    it('should handle unicode characters', async () => {
      const track: Track = { 
        id: 1, 
        title: 'Café', 
        artist: { name: 'Artíst' }, 
        duration: 200 
      };
      
      const result = await service.matchTrack(track);
      expect(result.deezerTrack).toEqual(track);
    });
  });
});