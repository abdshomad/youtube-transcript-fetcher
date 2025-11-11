
import React, { useState, useCallback, useMemo } from 'react';
import type { Video, DownloadRecord } from './types';
import PlaylistForm from './components/PlaylistForm';
import VideoGrid from './components/VideoGrid';
import TranscriptModal from './components/TranscriptModal';
import YouTubeIcon from './components/icons/YouTubeIcon';
import { generateTranscript, generateSummary, extractKeyTopics } from './services/geminiService';
import { fetchYouTubePlaylist } from './services/youtubeService';
import DownloadHistory from './components/DownloadHistory';
import { toSrt, toVtt } from './utils/transcriptFormatters';
import PlaylistHistoryMenu from './components/PlaylistHistoryMenu';
import Spinner from './components/ui/Spinner';
import DownloadIcon from './components/icons/DownloadIcon';
import AuthModal from './components/AuthModal';
import UserIcon from './components/icons/UserIcon';


declare var JSZip: any;
const SUPPORTED_LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Mandarin Chinese', 'Hindi', 'Portuguese'];

interface UserData {
  downloadHistory: DownloadRecord[];
  editedTranscripts: Record<string, string>; // videoId -> transcript
}

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
  const [redownloadingId, setRedownloadingId] = useState<string | null>(null);
  const [selectedPlaylistTopic, setSelectedPlaylistTopic] = useState<string | null>(null);

  // User Auth & Data State
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userData, setUserData] = useState<UserData>({ downloadHistory: [], editedTranscripts: {} });
  
  const downloadHistory = userData.downloadHistory;

  // State for batch generation
  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set());
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ processed: 0, total: 0 });
  const [batchItemStatus, setBatchItemStatus] = useState<Record<string, 'pending' | 'success' | 'error'>>({});
  const [batchLanguage, setBatchLanguage] = useState('English');

  const saveUserData = useCallback((data: UserData, username: string) => {
    if (!username) return;
    try {
        localStorage.setItem(`userData_${username}`, JSON.stringify(data));
    } catch (err) {
        console.error("Failed to save user data:", err);
    }
  }, []);

  const handleLogin = useCallback((username: string) => {
    const storedData = localStorage.getItem(`userData_${username}`);
    if (storedData) {
        try {
            const parsedData: UserData = JSON.parse(storedData);
            setUserData(parsedData);
        } catch (error) {
            console.error("Failed to parse user data:", error);
            setUserData({ downloadHistory: [], editedTranscripts: {} });
        }
    } else {
        setUserData({ downloadHistory: [], editedTranscripts: {} });
    }
    setCurrentUser(username);
    setIsAuthModalOpen(false);
    
    // Reset view for new user session
    setVideos([]);
    setPlaylistUrl('');
    setPlaylistTopicInput('');
    setError(null);
    setSelectedPlaylistTopic(null);
  }, []);

  const handleLogout = useCallback(() => {
      setCurrentUser(null);
      setUserData({ downloadHistory: [], editedTranscripts: {} });
      // Clear current playlist and state
      setVideos([]);
      setPlaylistUrl('');
      setPlaylistTopicInput('');
      setError(null);
      setSelectedPlaylistTopic(null);
  }, []);

  const handleFetchPlaylist = useCallback(async () => {
    const input = playlistUrl.trim() || playlistTopicInput.trim();
    if (!input) {
        setError("Please enter a YouTube playlist URL or a topic.");
        return;
    }
    setIsLoadingPlaylist(true);
    setError(null);
    setVideos([]);
    setSelectedVideoIds(new Set());
    
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
      const updateState = (prev: UserData): UserData => {
        const newRecord: DownloadRecord = { ...record, id: Date.now().toString(), downloadedAt: new Date() };
        setSelectedPlaylistTopic(newRecord.playlistTopic);
        const otherRecords = prev.downloadHistory.filter(r => !(r.videoId === record.videoId && r.format === record.format));
        return { ...prev, downloadHistory: [newRecord, ...otherRecords] };
      };

      if (currentUser) {
        setUserData(prev => {
          const newUserData = updateState(prev);
          saveUserData(newUserData, currentUser);
          return newUserData;
        });
      } else {
        setUserData(updateState);
      }
  }, [currentUser, saveUserData]);

   const handleSaveEditedTranscript = useCallback((videoId: string, newTranscript: string) => {
      if (!currentUser) return; // Only logged in users can save edits

      setUserData(prev => {
          const newUserData: UserData = {
              ...prev,
              editedTranscripts: {
                  ...prev.editedTranscripts,
                  [videoId]: newTranscript,
              }
          };
          saveUserData(newUserData, currentUser);
          return newUserData;
      });
  }, [currentUser, saveUserData]);

  const handleRedownload = useCallback(async (record: DownloadRecord) => {
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

        const updateHistory = (prev: UserData): UserData => {
          const updatedRecord = { ...record, downloadedAt: new Date() };
          const newHistory = [updatedRecord, ...prev.downloadHistory.filter(r => r.id !== record.id)];
          return { ...prev, downloadHistory: newHistory };
        };

        if (currentUser) {
            setUserData(prev => {
                const newUserData = updateHistory(prev);
                saveUserData(newUserData, currentUser);
                return newUserData;
            });
        } else {
            setUserData(updateHistory);
        }

    } catch (err) {
        console.error("Error re-downloading transcript:", err);
        alert("An error occurred while trying to re-download the transcript.");
    } finally {
        setRedownloadingId(null);
    }
  }, [videos, currentPlaylistTopic, currentUser, saveUserData]);

  const playlistGroups = useMemo(() => {
    const groups = new Map<string, number>();
    downloadHistory.forEach(record => {
        groups.set(record.playlistTopic, (groups.get(record.playlistTopic) || 0) + 1);
    });
    return groups;
  }, [downloadHistory]);

  const filteredHistory = useMemo(() => {
      if (selectedPlaylistTopic === null && downloadHistory.length > 0) {
          return downloadHistory;
      }
      return downloadHistory.filter(record => record.playlistTopic === selectedPlaylistTopic);
  }, [downloadHistory, selectedPlaylistTopic]);

  // Batch selection handlers
  const handleToggleVideoSelection = (videoId: string) => {
    if (isBatchGenerating) return;
    setSelectedVideoIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(videoId)) {
        newSelection.delete(videoId);
      } else {
        newSelection.add(videoId);
      }
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (isBatchGenerating) return;
    if (selectedVideoIds.size === videos.length) {
      setSelectedVideoIds(new Set());
    } else {
      setSelectedVideoIds(new Set(videos.map(v => v.id)));
    }
  };

  const handleBatchGenerate = async () => {
    if (selectedVideoIds.size === 0) return;

    setIsBatchGenerating(true);
    setBatchProgress({ processed: 0, total: selectedVideoIds.size });
    const initialStatus: Record<string, 'pending' | 'success' | 'error'> = {};
    selectedVideoIds.forEach(id => { initialStatus[id] = 'pending'; });
    setBatchItemStatus(initialStatus);

    const zip = new JSZip();
    const errors: string[] = [];
    let processedCount = 0;

    const downloadFile = (filename: string, content: Blob) => {
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    for (const videoId of selectedVideoIds) {
      const video = videos.find(v => v.id === videoId);
      if (!video) continue;

      try {
        const transcript = await generateTranscript(video.title, batchLanguage);
        const safeTitle = video.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `transcript_${safeTitle}.txt`;

        zip.file(fileName, transcript);
        
        handleAddDownloadRecord({
          videoId,
          videoTitle: video.title,
          playlistTopic: currentPlaylistTopic,
          format: 'txt',
          fileName,
        });

        setBatchItemStatus(prev => ({ ...prev, [videoId]: 'success' }));
      } catch (err) {
        errors.push(`${video.title}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setBatchItemStatus(prev => ({ ...prev, [videoId]: 'error' }));
      }

      processedCount++;
      setBatchProgress({ processed: processedCount, total: selectedVideoIds.size });
    }

    if (Object.keys(zip.files).length > 0) {
      const content = await zip.generateAsync({ type: 'blob' });
      const safePlaylistTitle = currentPlaylistTopic.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'playlist';
      downloadFile(`transcripts_${safePlaylistTitle}_${new Date().toISOString().split('T')[0]}.zip`, content);
    }
    
    if (errors.length > 0) {
      alert(`Finished with ${errors.length} error(s):\n\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`);
    }
    
    setTimeout(() => {
        setIsBatchGenerating(false);
        setSelectedVideoIds(new Set());
        setBatchItemStatus({});
        setBatchProgress({ processed: 0, total: 0 });
    }, 5000);
  };

  const progressPercentage = batchProgress.total > 0 ? (batchProgress.processed / batchProgress.total) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 md:p-8 relative">
       <div className="w-full max-w-7xl absolute top-0 right-0 p-4 sm:p-6 md:p-8 flex justify-end z-10">
          {currentUser ? (
              <div className="flex items-center gap-4 bg-gray-800 bg-opacity-80 p-2 rounded-lg">
                  <span className="text-gray-300">Welcome, <span className="font-bold">{currentUser}</span>!</span>
                  <button onClick={handleLogout} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                      Logout
                  </button>
              </div>
          ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-lg">
                  <UserIcon className="w-5 h-5" />
                  Login to Sync
              </button>
          )}
      </div>

      <header className="w-full max-w-2xl text-center mb-8 mt-16 sm:mt-12">
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
        
        {selectedVideoIds.size > 0 && !isLoadingPlaylist && videos.length > 0 && (
          <div className="w-full max-w-7xl mt-8 p-3 bg-gray-800 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-700">
            {isBatchGenerating ? (
                <div className="w-full flex items-center gap-4">
                    <span className="font-bold text-white whitespace-nowrap">Generating... ({batchProgress.processed}/{batchProgress.total})</span>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-red-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-4">
                        <span className="font-bold text-white">{selectedVideoIds.size} selected</span>
                        <button onClick={handleSelectAll} className="text-sm text-red-400 hover:text-red-300 font-semibold">
                            {selectedVideoIds.size === videos.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={batchLanguage}
                            onChange={(e) => setBatchLanguage(e.target.value)}
                            className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            aria-label="Select batch transcript language"
                        >
                            {SUPPORTED_LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                        </select>
                        <button 
                            onClick={handleBatchGenerate}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            Generate & Download All (.zip)
                        </button>
                    </div>
                </>
            )}
          </div>
        )}
        
        <VideoGrid
          videos={videos}
          onGetTranscript={handleOpenTranscriptModal}
          isLoading={isLoadingPlaylist || isBatchGenerating}
          loadingTranscriptFor={isLoadingTranscript ? selectedVideo?.id ?? null : null}
          selectedVideoIds={selectedVideoIds}
          onToggleVideoSelection={handleToggleVideoSelection}
          batchItemStatus={batchItemStatus}
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

       {isAuthModalOpen && (
          <AuthModal 
              onClose={() => setIsAuthModalOpen(false)} 
              onLogin={handleLogin}
          />
      )}

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
          supportedLanguages={SUPPORTED_LANGUAGES}
          editedTranscript={userData.editedTranscripts[selectedVideo.id]}
          onSaveEditedTranscript={handleSaveEditedTranscript}
          isLoggedIn={!!currentUser}
        />
      )}
    </div>
  );
};

export default App;
