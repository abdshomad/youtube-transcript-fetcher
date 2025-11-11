import React, { useState, useCallback, useMemo } from 'react';
import type { Video, DownloadRecord } from './types';
import PlaylistForm from './components/PlaylistForm';
import VideoGrid from './components/VideoGrid';
import TranscriptModal from './components/TranscriptModal';
import YouTubeIcon from './components/icons/YouTubeIcon';
import { generateTranscript, generateSummary, extractKeyTopics } from './services/geminiService';
import { fetchYouTubePlaylist } from './services/youtubeService';
// import { generateTranscript } from './services/mockApiService';
import DownloadHistory from './components/DownloadHistory';
import { toSrt, toVtt } from './utils/transcriptFormatters';
import PlaylistHistoryMenu from './components/PlaylistHistoryMenu';


declare var JSZip: any;

const App: React.FC = () => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [playlistTopicInput, setPlaylistTopicInput] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  
  const [summary, setSummary] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [keyTopics, setKeyTopics] = useState<string[]>([]);
  const [isLoadingKeyTopics, setIsLoadingKeyTopics] = useState(false);
  const [keyTopicsError, setKeyTopicsError] = useState<string | null>(null);

  const [currentPlaylistTopic, setCurrentPlaylistTopic] = useState<string>('');
  const [downloadHistory, setDownloadHistory] = useState<DownloadRecord[]>([]);
  const [redownloadingId, setRedownloadingId] = useState<string | null>(null);
  const [selectedPlaylistTopic, setSelectedPlaylistTopic] = useState<string | null>(null);
  
  const handleFetchPlaylist = useCallback(async () => {
    const input = playlistUrl.trim() || playlistTopicInput.trim();
    if (!input) {
        setError("Please enter a YouTube playlist URL or a topic.");
        return;
    }
    setIsLoadingPlaylist(true);
    setError(null);
    setVideos([]);
    
    try {
      const { playlistTitle, videos } = await fetchYouTubePlaylist(input);
      setVideos(videos);
      setCurrentPlaylistTopic(playlistTitle);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to fetch playlist: ${errorMessage} Please try again.`);
      console.error(err);
    } finally {
      setIsLoadingPlaylist(false);
    }
  }, [playlistUrl, playlistTopicInput]);

  
  const handleOpenTranscriptModal = useCallback((video: Video) => {
    setSelectedVideo(video);
    setTranscript('');
    setTranscriptError(null);
    setSummary('');
    setSummaryError(null);
    setKeyTopics([]);
    setKeyTopicsError(null);
  }, []);

  const handleGenerateTranscript = useCallback(async (language: string) => {
    if (isLoadingTranscript || !selectedVideo) return;

    setIsLoadingTranscript(true);
    setTranscriptError(null);

    try {
      const fetchedTranscript = await generateTranscript(selectedVideo.title, language);
      setTranscript(fetchedTranscript);
    } catch (err) {
       const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setTranscriptError(errorMessage);
      console.error(err);
    } finally {
      setIsLoadingTranscript(false);
    }
  }, [isLoadingTranscript, selectedVideo]);
  
  const handleGetSummary = useCallback(async (transcriptToSummarize: string) => {
    if (isLoadingSummary || !transcriptToSummarize) return;
    
    setIsLoadingSummary(true);
    setSummary('');
    setSummaryError(null);

    try {
        const fetchedSummary = await generateSummary(transcriptToSummarize);
        setSummary(fetchedSummary);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setSummaryError(errorMessage);
        console.error(err);
    } finally {
        setIsLoadingSummary(false);
    }
  }, [isLoadingSummary]);

  const handleExtractKeyTopics = useCallback(async (transcriptToAnalyze: string) => {
    if (isLoadingKeyTopics || !transcriptToAnalyze) return;
    
    setIsLoadingKeyTopics(true);
    setKeyTopics([]);
    setKeyTopicsError(null);

    try {
        const fetchedTopics = await extractKeyTopics(transcriptToAnalyze);
        setKeyTopics(fetchedTopics);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setKeyTopicsError(errorMessage);
        console.error(err);
    } finally {
        setIsLoadingKeyTopics(false);
    }
  }, [isLoadingKeyTopics]);


  const handleCloseModal = () => {
    setSelectedVideo(null);
    setTranscript('');
    setTranscriptError(null);
    setSummary('');
    setSummaryError(null);
    setKeyTopics([]);
    setKeyTopicsError(null);
  };
  
  const handleAddDownloadRecord = useCallback((record: Omit<DownloadRecord, 'id' | 'downloadedAt'>) => {
     setDownloadHistory(prev => {
      const newRecord: DownloadRecord = { ...record, id: Date.now().toString(), downloadedAt: new Date() };
      
      // Select the playlist of the newly downloaded item
      setSelectedPlaylistTopic(newRecord.playlistTopic);

      // Filter out any previous download for the same video and format to avoid duplicates
      const otherRecords = prev.filter(r => !(r.videoId === record.videoId && r.format === record.format));
      return [newRecord, ...otherRecords];
    });
  }, []);

  const handleRedownload = useCallback(async (record: DownloadRecord) => {
    // This assumes the video is part of the currently loaded playlist.
    // A more robust implementation might need to store video data alongside download records.
    const video = videos.find(v => v.id === record.videoId);
    if (!video && record.playlistTopic !== currentPlaylistTopic) {
        alert(`Please fetch the "${record.playlistTopic}" playlist again to re-download this transcript.`);
        return;
    }
    if (!video) {
        alert("Could not find the video in the current playlist. Please fetch the playlist again.");
        return;
    }


    setRedownloadingId(record.id);
    try {
        const transcriptContent = await generateTranscript(video.title);

        const downloadFile = (filename: string, content: string | Blob) => {
            const blob = content instanceof Blob ? content : new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        };

        const safeTitle = record.videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        if (record.format === 'txt') {
            downloadFile(record.fileName, transcriptContent);
        } else if (record.format === 'srt') {
            downloadFile(record.fileName, toSrt(transcriptContent));
        } else if (record.format === 'vtt') {
            downloadFile(record.fileName, toVtt(transcriptContent));
        } else if (record.format === 'all') {
            const zip = new JSZip();
            zip.file(`transcript_${safeTitle}.txt`, transcriptContent);
            zip.file(`transcript_${safeTitle}.srt`, toSrt(transcriptContent));
            zip.file(`transcript_${safeTitle}.vtt`, toVtt(transcriptContent));
            const content = await zip.generateAsync({ type: 'blob' });
            downloadFile(record.fileName, content);
        }

        // Update timestamp and move to top of history
        setDownloadHistory(prev => {
            const updatedRecord = { ...record, downloadedAt: new Date() };
            return [updatedRecord, ...prev.filter(r => r.id !== record.id)];
        });

    } catch (err) {
        console.error("Error re-downloading transcript:", err);
        alert("An error occurred while trying to re-download the transcript.");
    } finally {
        setRedownloadingId(null);
    }
  }, [videos, currentPlaylistTopic]);

  const playlistGroups = useMemo(() => {
    const groups = new Map<string, number>();
    downloadHistory.forEach(record => {
        groups.set(record.playlistTopic, (groups.get(record.playlistTopic) || 0) + 1);
    });
    return groups;
  }, [downloadHistory]);

  const filteredHistory = useMemo(() => {
      if (selectedPlaylistTopic === null && downloadHistory.length > 0) { // 'All' is selected
          return downloadHistory;
      }
      return downloadHistory.filter(record => record.playlistTopic === selectedPlaylistTopic);
  }, [downloadHistory, selectedPlaylistTopic]);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-2xl text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-2">
            <YouTubeIcon className="w-16 h-16 text-red-600" />
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Playlist Transcript Fetcher</h1>
        </div>
        <p className="text-gray-400 text-md sm:text-lg">
           Enter a YouTube playlist URL directly, or search for a topic to find a relevant playlist.
        </p>
      </header>

      <main className="w-full flex flex-col items-center">
        <PlaylistForm 
          url={playlistUrl}
          setUrl={setPlaylistUrl}
          topic={playlistTopicInput}
          setTopic={setPlaylistTopicInput}
          onSubmit={handleFetchPlaylist}
          isLoading={isLoadingPlaylist}
        />
        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
        
        <VideoGrid
          videos={videos}
          onGetTranscript={handleOpenTranscriptModal}
          isLoading={isLoadingPlaylist}
          loadingTranscriptFor={isLoadingTranscript ? selectedVideo?.id ?? null : null}
        />
        
        {downloadHistory.length > 0 && (
          <div className="w-full max-w-7xl mt-12 grid grid-cols-1 md:grid-cols-4 gap-8">
            <aside className="md:col-span-1">
              <PlaylistHistoryMenu
                playlistGroups={playlistGroups}
                selectedTopic={selectedPlaylistTopic}
                onSelectTopic={setSelectedPlaylistTopic}
                totalCount={downloadHistory.length}
              />
            </aside>
            <section className="md:col-span-3">
              <DownloadHistory 
                  history={filteredHistory}
                  onRedownload={handleRedownload}
                  redownloadingId={redownloadingId}
                  activePlaylistTopic={selectedPlaylistTopic}
              />
            </section>
          </div>
        )}
      </main>

      {selectedVideo && (
        <TranscriptModal
          videoId={selectedVideo.id}
          videoTitle={selectedVideo.title}
          transcript={transcript}
          isLoading={isLoadingTranscript}
          onClose={handleCloseModal}
          playlistTopic={currentPlaylistTopic}
          onDownload={handleAddDownloadRecord}
          error={transcriptError}
          summary={summary}
          isLoadingSummary={isLoadingSummary}
          summaryError={summaryError}
          onGetSummary={handleGetSummary}
          keyTopics={keyTopics}
          isLoadingKeyTopics={isLoadingKeyTopics}
          keyTopicsError={keyTopicsError}
          onExtractKeyTopics={handleExtractKeyTopics}
          onGenerate={handleGenerateTranscript}
        />
      )}
    </div>
  );
};

export default App;