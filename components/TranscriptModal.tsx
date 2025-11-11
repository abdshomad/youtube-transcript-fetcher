import React, { useEffect, useRef, useState } from 'react';
import Spinner from './ui/Spinner';
import DownloadIcon from './icons/DownloadIcon';
import { toSrt, toVtt } from '../utils/transcriptFormatters';
import SearchIcon from './icons/SearchIcon';
import ChevronUpIcon from './icons/ChevronUpIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import XIcon from './icons/XIcon';
import EditIcon from './icons/EditIcon';
import SaveIcon from './icons/SaveIcon';


declare var JSZip: any;

interface TranscriptModalProps {
  videoId: string;
  videoTitle: string;
  transcript: string;
  isLoading: boolean;
  onClose: () => void;
  playlistTopic: string;
  onDownload: (record: { videoId: string; videoTitle: string; playlistTopic: string; format: 'txt' | 'srt' | 'vtt' | 'all'; fileName: string; }) => void;
  error: string | null;
}

const TranscriptModal: React.FC<TranscriptModalProps> = ({ videoId, videoTitle, transcript, isLoading, onClose, onDownload, error, playlistTopic }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [matches, setMatches] = useState<{ start: number; end: number }[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const highlightRefs = useRef<(HTMLElement | null)[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [editedTranscript, setEditedTranscript] = useState('');
  
  useEffect(() => {
    const savedTranscript = localStorage.getItem(`transcript_${videoId}`);
    const initialTranscript = savedTranscript ?? transcript;
    setCurrentTranscript(initialTranscript);
    setEditedTranscript(initialTranscript);
  }, [transcript, videoId]);


  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isDropdownOpen) {
          setIsDropdownOpen(false);
        } else if (isEditing) {
          handleCancel();
        }
        else {
          onClose();
        }
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, isDropdownOpen, isEditing]);
  
   useEffect(() => {
    if (!searchQuery || !currentTranscript) {
      setMatches([]);
      setCurrentMatchIndex(-1);
      return;
    }
    const regex = new RegExp(searchQuery, 'gi');
    const newMatches: { start: number; end: number }[] = [];
    let match;
    while ((match = regex.exec(currentTranscript)) !== null) {
      newMatches.push({ start: match.index, end: regex.lastIndex });
    }
    setMatches(newMatches);
    setCurrentMatchIndex(newMatches.length > 0 ? 0 : -1);
    highlightRefs.current = new Array(newMatches.length);
  }, [searchQuery, currentTranscript]);

  useEffect(() => {
    if (currentMatchIndex !== -1 && highlightRefs.current[currentMatchIndex]) {
      highlightRefs.current[currentMatchIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentMatchIndex]);


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

  const handleDownload = async (format: 'txt' | 'srt' | 'vtt' | 'all') => {
    if (!currentTranscript) return;
    setIsDropdownOpen(false);

    const safeTitle = videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    try {
      if (format === 'txt') {
        const fileName = `transcript_${safeTitle}.txt`;
        downloadFile(fileName, currentTranscript);
        onDownload({ videoId, videoTitle, playlistTopic, format: 'txt', fileName });
      } else if (format === 'srt') {
        const srtContent = toSrt(currentTranscript);
        const fileName = `transcript_${safeTitle}.srt`;
        downloadFile(fileName, srtContent);
        onDownload({ videoId, videoTitle, playlistTopic, format: 'srt', fileName });
      } else if (format === 'vtt') {
        const vttContent = toVtt(currentTranscript);
        const fileName = `transcript_${safeTitle}.vtt`;
        downloadFile(fileName, vttContent);
        onDownload({ videoId, videoTitle, playlistTopic, format: 'vtt', fileName });
      } else if (format === 'all') {
        const zip = new JSZip();
        zip.file(`transcript_${safeTitle}.txt`, currentTranscript);
        zip.file(`transcript_${safeTitle}.srt`, toSrt(currentTranscript));
        zip.file(`transcript_${safeTitle}.vtt`, toVtt(currentTranscript));

        const content = await zip.generateAsync({ type: 'blob' });
        const fileName = `transcripts_${safeTitle}.zip`;
        downloadFile(fileName, content);
        onDownload({ videoId, videoTitle, playlistTopic, format: 'all', fileName });
      }
    } catch (err) {
      console.error(`Error creating download for format ${format}:`, err);
    }
  };
  
  const handlePrevMatch = () => {
    if (matches.length > 0) {
      setCurrentMatchIndex(prev => (prev - 1 + matches.length) % matches.length);
    }
  };
  const handleNextMatch = () => {
    if (matches.length > 0) {
      setCurrentMatchIndex(prev => (prev + 1) % matches.length);
    }
  };

  const handleSave = () => {
    localStorage.setItem(`transcript_${videoId}`, editedTranscript);
    setCurrentTranscript(editedTranscript);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTranscript(currentTranscript);
    setIsEditing(false);
  };

  const renderHighlightedTranscript = () => {
    if (!searchQuery || matches.length === 0) {
        return <>{currentTranscript}</>;
    }

    const parts = [];
    let lastIndex = 0;

    matches.forEach((match, index) => {
        if (match.start > lastIndex) {
            parts.push(currentTranscript.substring(lastIndex, match.start));
        }
        parts.push(
            <mark
                key={`match-${index}`}
                ref={el => (highlightRefs.current[index] = el)}
                className={index === currentMatchIndex ? 'bg-orange-500 text-black px-1 rounded' : 'bg-yellow-500 bg-opacity-70 px-1 rounded'}
            >
                {currentTranscript.substring(match.start, match.end)}
            </mark>
        );
        lastIndex = match.end;
    });

    if (lastIndex < currentTranscript.length) {
        parts.push(currentTranscript.substring(lastIndex));
    }

    return <>{parts}</>;
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col text-white transform transition-all duration-300 scale-95 animate-scale-in"
      >
        <header className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold truncate pr-4" title={videoTitle}>Transcript: {videoTitle}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none font-bold">&times;</button>
        </header>
        <main className="p-6 overflow-y-auto flex-grow">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <Spinner className="w-10 h-10 text-red-500" />
              <p className="mt-4 text-gray-300">Generating transcript...</p>
            </div>
          )}
          {error && !isLoading && (
             <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-red-400">{error}</p>
            </div>
          )}
          {!isLoading && !error && (
            isEditing ? (
               <textarea
                value={editedTranscript}
                onChange={(e) => setEditedTranscript(e.target.value)}
                className="w-full h-full bg-gray-900 text-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-red-500 resize-none"
                style={{ minHeight: '40vh' }}
                aria-label="Transcript editor"
              />
            ) : (
                <div className="prose prose-invert max-w-none whitespace-pre-wrap text-gray-300">
                    {renderHighlightedTranscript()}
                </div>
            )
          )}
        </main>
        <footer className="p-4 border-t border-gray-700 flex justify-between items-center gap-4 flex-wrap">
            <div className="flex-grow max-w-sm">
                {!isEditing && (
                    <div className="flex items-center gap-2 bg-gray-700 rounded-lg px-2 w-full">
                        <SearchIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search transcript..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-transparent text-white outline-none py-2 w-full text-sm"
                        />
                        {searchQuery && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <span className="text-gray-400 text-sm whitespace-nowrap">
                                    {matches.length > 0 ? `${currentMatchIndex + 1} of ${matches.length}` : '0 of 0'}
                                </span>
                                <button onClick={handlePrevMatch} disabled={matches.length === 0} className="p-1 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed">
                                    <ChevronUpIcon className="w-5 h-5" />
                                </button>
                                <button onClick={handleNextMatch} disabled={matches.length === 0} className="p-1 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed">
                                    <ChevronDownIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => setSearchQuery('')} className="p-1 text-gray-400 hover:text-white">
                                    <XIcon className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
          
            <div className="flex items-center gap-2 flex-shrink-0">
                {isEditing ? (
                    <>
                        <button onClick={handleCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Cancel</button>
                        <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                            <SaveIcon className="w-5 h-5" />
                            Save
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setIsEditing(true)} disabled={isLoading || !!error || !currentTranscript} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                            <EditIcon className="w-5 h-5" />
                            Edit
                        </button>
                        <div className="relative" ref={dropdownRef}>
                            <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            disabled={isLoading || !!error || !currentTranscript}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                            aria-haspopup="true"
                            aria-expanded={isDropdownOpen}
                            >
                            <DownloadIcon className="w-5 h-5" />
                            Download
                            <svg className={`w-4 h-4 ml-1 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>

                            {isDropdownOpen && (
                            <div className="origin-top-right absolute right-0 bottom-full mb-2 w-56 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 z-10">
                                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); handleDownload('txt'); }}
                                    className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                                    role="menuitem"
                                >
                                    Download as .txt
                                </a>
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); handleDownload('srt'); }}
                                    className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                                    role="menuitem"
                                >
                                    Download as .srt
                                </a>
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); handleDownload('vtt'); }}
                                    className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                                    role="menuitem"
                                >
                                    Download as .vtt
                                </a>
                                <div className="border-t border-gray-600 my-1"></div>
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); handleDownload('all'); }}
                                    className="block px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-600"
                                    role="menuitem"
                                >
                                    Download All (.zip)
                                </a>
                                </div>
                            </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </footer>
      </div>
       <style>{`
        @keyframes scale-in {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default TranscriptModal;