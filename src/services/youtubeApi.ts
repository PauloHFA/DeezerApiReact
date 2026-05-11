const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export interface YoutubeVideoData {
  videoId: string;
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

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(
    query
  )}&key=${YOUTUBE_API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    console.error('YouTube search request failed', response.status, response.statusText);
    return null;
  }

  const data = await response.json();
  const item = data?.items?.[0];
  if (!item || !item.id?.videoId) {
    return null;
  }

  const thumbnails = item.snippet?.thumbnails;
  const thumbnailUrl =
    thumbnails?.standard?.url || thumbnails?.high?.url || thumbnails?.medium?.url || thumbnails?.default?.url || '';

  return {
    videoId: item.id.videoId,
    title: item.snippet?.title ?? '',
    channelTitle: item.snippet?.channelTitle ?? '',
    thumbnailUrl,
  };
};
