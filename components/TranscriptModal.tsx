import React, { useEffect, useRef, useState } from 'react';
import Spinner from './ui/Spinner';
import DownloadIcon from './icons/DownloadIcon';
import { toSrt, toVtt } from '../utils/transcriptFormatters';

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

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isDropdownOpen) {
          setIsDropdownOpen(false);
        } else {
          onClose();
        }
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
      // Close dropdown if clicked outside of it
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      // Close modal if clicked outside of it
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
  }, [onClose, isDropdownOpen]);

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
    if (!transcript) return;
    setIsDropdownOpen(false);

    const safeTitle = videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    try {
      if (format === 'txt') {
        const fileName = `transcript_${safeTitle}.txt`;
        downloadFile(fileName, transcript);
        onDownload({ videoId, videoTitle, playlistTopic, format: 'txt', fileName });
      } else if (format === 'srt') {
        const srtContent = toSrt(transcript);
        const fileName = `transcript_${safeTitle}.srt`;
        downloadFile(fileName, srtContent);
        onDownload({ videoId, videoTitle, playlistTopic, format: 'srt', fileName });
      } else if (format === 'vtt') {
        const vttContent = toVtt(transcript);
        const fileName = `transcript_${safeTitle}.vtt`;
        downloadFile(fileName, vttContent);
        onDownload({ videoId, videoTitle, playlistTopic, format: 'vtt', fileName });
      } else if (format === 'all') {
        const zip = new JSZip();
        zip.file(`transcript_${safeTitle}.txt`, transcript);
        zip.file(`transcript_${safeTitle}.srt`, toSrt(transcript));
        zip.file(`transcript_${safeTitle}.vtt`, toVtt(transcript));

        const content = await zip.generateAsync({ type: 'blob' });
        const fileName = `transcripts_${safeTitle}.zip`;
        downloadFile(fileName, content);
        onDownload({ videoId, videoTitle, playlistTopic, format: 'all', fileName });
      }
    } catch (err) {
      console.error(`Error creating download for format ${format}:`, err);
    }
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
            <div className="prose prose-invert max-w-none whitespace-pre-wrap text-gray-300">
                {transcript.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
            </div>
          )}
        </main>
        <footer className="p-4 border-t border-gray-700 flex justify-end">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isLoading || !!error || !transcript}
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