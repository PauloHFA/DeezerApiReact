/**
 * Track Matching Service
 * Finds equivalent tracks on YouTube and Spotify based on Deezer track metadata
 */

import { fetchYoutubeVideoData } from './youtubeApi';
import { spotifyService, SpotifyTrack } from './spotifyApi';
import type { Track } from '@/types';

export interface MatchedTrack {
  deezerTrack: Track;
  youtubeVideoId: string | null;
  youtubeTitle: string | null;
  spotifyTrack: SpotifyTrack | null;
  matchConfidence: 'high' | 'medium' | 'low' | 'none';
}

export class TrackMatchingService {
  private youtubeCache: Map<string, { videoId: string; title: string }> = new Map();
  private spotifyCache: Map<string, SpotifyTrack> = new Map();

  /**
   * Generate search query from track metadata
   */
  private generateSearchQuery(track: Track): string {
    const artistName = track.artist?.name || '';
    const trackTitle = track.title || '';
    return `${trackTitle} ${artistName}`.trim();
  }

  /**
   * Generate Spotify search query (more precise)
   */
  private generateSpotifyQuery(track: Track): string {
    const artistName = track.artist?.name || '';
    const trackTitle = track.title || '';
    const albumName = track.album?.title || '';
    
    // Try track + artist first
    return `track:"${trackTitle}" artist:"${artistName}"`;
  }

  /**
   * Match track on YouTube
   */
  async matchYouTube(track: Track): Promise<{ videoId: string | null; title: string | null }> {
    const cacheKey = `${track.artist?.name}-${track.title}`;
    
    if (this.youtubeCache.has(cacheKey)) {
      return this.youtubeCache.get(cacheKey)!;
    }

    const query = this.generateSearchQuery(track);
    const result = await fetchYoutubeVideoData(query);
    
    const match = result 
      ? { videoId: result.videoId, title: result.title }
      : { videoId: null, title: null };
    
    this.youtubeCache.set(cacheKey, match);
    return match;
  }

  /**
   * Match track on Spotify
   */
  async matchSpotify(track: Track): Promise<SpotifyTrack | null> {
    const cacheKey = `${track.artist?.name}-${track.title}`;
    
    if (this.spotifyCache.has(cacheKey)) {
      return this.spotifyCache.get(cacheKey)!;
    }

    if (!spotifyService.isAuthenticated()) {
      return null;
    }

    try {
      // Try precise search first
      const preciseQuery = this.generateSpotifyQuery(track);
      let response = await spotifyService.searchTracks(preciseQuery, 5);
      
      let bestMatch = this.findBestMatch(track, response.tracks.items);
      
      // If no good match, try broader search
      if (!bestMatch) {
        const broadQuery = this.generateSearchQuery(track);
        response = await spotifyService.searchTracks(broadQuery, 10);
        bestMatch = this.findBestMatch(track, response.tracks.items);
      }

      if (bestMatch) {
        this.spotifyCache.set(cacheKey, bestMatch);
      }
      
      return bestMatch;
    } catch (error) {
      console.error('Spotify matching error:', error);
      return null;
    }
  }

  /**
   * Find best matching track from search results
   */
  private findBestMatch(deezerTrack: Track, spotifyTracks: SpotifyTrack[]): SpotifyTrack | null {
    if (!spotifyTracks.length) return null;

    const deezerArtist = deezerTrack.artist?.name?.toLowerCase() || '';
    const deezerTitle = deezerTrack.title?.toLowerCase() || '';
    const deezerDuration = deezerTrack.duration || 0;

    let bestMatch: SpotifyTrack | null = null;
    let bestScore = 0;

    for (const spotifyTrack of spotifyTracks) {
      const spotifyArtist = spotifyTrack.artists[0]?.name?.toLowerCase() || '';
      const spotifyTitle = spotifyTrack.name?.toLowerCase() || '';
      const spotifyDuration = spotifyTrack.duration_ms / 1000;

      // Calculate similarity scores
      const artistScore = this.stringSimilarity(deezerArtist, spotifyArtist);
      const titleScore = this.stringSimilarity(deezerTitle, spotifyTitle);
      const durationScore = this.durationSimilarity(deezerDuration, spotifyDuration);

      // Weighted score (artist and title are most important)
      const score = (artistScore * 0.4) + (titleScore * 0.4) + (durationScore * 0.2);

      if (score > bestScore && score > 0.6) { // Minimum threshold
        bestScore = score;
        bestMatch = spotifyTrack;
      }
    }

    return bestMatch;
  }

  /**
   * Simple string similarity (Jaro-Winkler-like)
   */
  private stringSimilarity(a: string, b: string): number {
    if (!a || !b) return 0;
    if (a === b) return 1;

    // Normalize: remove special chars, extra spaces
    const normalize = (s: string) => s
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const na = normalize(a);
    const nb = normalize(b);

    if (na === nb) return 1;
    if (na.includes(nb) || nb.includes(na)) return 0.9;

    // Simple Levenshtein-based similarity
    const longer = na.length > nb.length ? na : nb;
    const shorter = na.length > nb.length ? nb : na;
    
    if (longer.length === 0) return 1;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Levenshtein distance
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Duration similarity (within 5 seconds = high)
   */
  private durationSimilarity(d1: number, d2: number): number {
    if (!d1 || !d2) return 0.5;
    const diff = Math.abs(d1 - d2);
    if (diff <= 3) return 1;
    if (diff <= 5) return 0.9;
    if (diff <= 10) return 0.7;
    if (diff <= 30) return 0.5;
    return 0.2;
  }

  /**
   * Match track on both platforms
   */
  async matchTrack(track: Track): Promise<MatchedTrack> {
    const [youtubeMatch, spotifyMatch] = await Promise.all([
      this.matchYouTube(track),
      this.matchSpotify(track),
    ]);

    // Determine overall confidence
    let confidence: MatchedTrack['matchConfidence'] = 'none';
    if (youtubeMatch.videoId && spotifyMatch) {
      confidence = 'high';
    } else if (youtubeMatch.videoId || spotifyMatch) {
      confidence = 'medium';
    }

    return {
      deezerTrack: track,
      youtubeVideoId: youtubeMatch.videoId,
      youtubeTitle: youtubeMatch.title,
      spotifyTrack: spotifyMatch,
      matchConfidence: confidence,
    };
  }

  /**
   * Match multiple tracks
   */
  async matchTracks(tracks: Track[]): Promise<MatchedTrack[]> {
    return Promise.all(tracks.map(track => this.matchTrack(track)));
  }

  /**
   * Clear caches
   */
  clearCache(): void {
    this.youtubeCache.clear();
    this.spotifyCache.clear();
  }
}

// Singleton instance
export const trackMatchingService = new TrackMatchingService();