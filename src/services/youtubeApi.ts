const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export interface YoutubeVideoData {
  videoId: string;
  candidateVideoIds: string[];
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
}

export const fetchYoutubeVideoData = async (
  query: string
): Promise<YoutubeVideoData | null> => {
  if (!YOUTUBE_API_KEY) {
    console.warn('Missing VITE_YOUTUBE_API_KEY. YouTube search will not be available.');
    return null;
  }

  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    videoEmbeddable: 'true',
    videoSyndicated: 'true',
    maxResults: '5',
    q: query,
    key: YOUTUBE_API_KEY,
  });
  const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    console.error('YouTube search request failed', response.status, response.statusText);
    return null;
  }

  const data = await response.json();
  const items = data?.items ?? [];
  const item = items.find((candidate: any) => candidate.id?.videoId);
  if (!item || !item.id?.videoId) {
    return null;
  }

  const thumbnails = item.snippet?.thumbnails;
  const thumbnailUrl =
    thumbnails?.standard?.url || thumbnails?.high?.url || thumbnails?.medium?.url || thumbnails?.default?.url || '';

  return {
    videoId: item.id.videoId,
    candidateVideoIds: items
      .map((candidate: any) => candidate.id?.videoId)
      .filter((videoId: string | undefined): videoId is string => Boolean(videoId)),
    title: item.snippet?.title ?? '',
    channelTitle: item.snippet?.channelTitle ?? '',
    thumbnailUrl,
  };
};
