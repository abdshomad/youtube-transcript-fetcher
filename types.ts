
export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
}

export interface DownloadRecord {
  id: string;
  videoId: string;
  videoTitle: string;
  playlistTopic: string;
  format: 'txt' | 'srt' | 'vtt' | 'all';
  fileName: string;
  downloadedAt: Date;
}