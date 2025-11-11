import React, { useState, useCallback } from 'react';
import type { Video, DownloadRecord } from './types';
import PlaylistForm from './components/PlaylistForm';
import VideoGrid from './components/VideoGrid';
import TranscriptModal from './components/TranscriptModal';
import YouTubeIcon from './components/icons/YouTubeIcon';
// import { generatePlaylistData, generateTranscript } from './services/geminiService';
import { generatePlaylistData, generateTranscript } from './services/mockApiService';
import DownloadHistory from './components/DownloadHistory';

const App: React.FC = () => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

  const [downloadHistory, setDownloadHistory] = useState<DownloadRecord[]>([]);
  
  const handleFetchPlaylist = useCallback(async () => {
    setIsLoadingPlaylist(true);
    setError(null);
    setVideos([]);
    try {
      const topic = playlistUrl.trim() || 'React development tutorials';
      const fetchedVideos = await generatePlaylistData(topic);
      setVideos(fetchedVideos);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to fetch playlist: ${errorMessage} Please try again.`);
      console.error(err);
    } finally {
      setIsLoadingPlaylist(false);
    }
  }, [playlistUrl]);
  
  const handleGetTranscript = useCallback(async (video: Video) => {
    if (isLoadingTranscript) return;

    setSelectedVideo(video);
    setIsLoadingTranscript(true);
    setTranscript('');
    setTranscriptError(null);

    try {
      const fetchedTranscript = await generateTranscript(video.title);
      setTranscript(fetchedTranscript);
    } catch (err) {
       const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setTranscriptError(errorMessage);
      console.error(err);
    } finally {
      setIsLoadingTranscript(false);
    }
  }, [isLoadingTranscript]);

  const handleCloseModal = () => {
    setSelectedVideo(null);
    setTranscript('');
    setTranscriptError(null);
  };
  
  const handleAddDownloadRecord = useCallback((record: Omit<DownloadRecord, 'id' | 'downloadedAt'>) => {
    setDownloadHistory(prev => [
      { ...record, id: Date.now().toString(), downloadedAt: new Date() },
      ...prev
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-2xl text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-2">
            <YouTubeIcon className="w-16 h-16 text-red-600" />
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Playlist Transcript Fetcher</h1>
        </div>
        <p className="text-gray-400 text-md sm:text-lg">
            Generate a mock playlist based on a topic and fetch AI-generated transcripts for any video.
        </p>
      </header>

      <main className="w-full flex flex-col items-center">
        <PlaylistForm 
          url={playlistUrl}
          setUrl={setPlaylistUrl}
          onSubmit={handleFetchPlaylist}
          isLoading={isLoadingPlaylist}
        />
        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}

        <VideoGrid
          videos={videos}
          onGetTranscript={handleGetTranscript}
          isLoading={isLoadingPlaylist}
          loadingTranscriptFor={isLoadingTranscript ? selectedVideo?.id ?? null : null}
        />
        
        <DownloadHistory history={downloadHistory} />
      </main>

      {selectedVideo && (
        <TranscriptModal
          videoTitle={selectedVideo.title}
          transcript={transcript}
          isLoading={isLoadingTranscript}
          onClose={handleCloseModal}
          onDownload={handleAddDownloadRecord}
          error={transcriptError}
        />
      )}
    </div>
  );
};

export default App;