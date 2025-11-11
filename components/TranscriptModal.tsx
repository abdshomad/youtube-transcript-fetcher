
import React, { useEffect, useRef } from 'react';
import Spinner from './ui/Spinner';

interface TranscriptModalProps {
  videoTitle: string;
  transcript: string;
  isLoading: boolean;
  onClose: () => void;
  error: string | null;
}

const TranscriptModal: React.FC<TranscriptModalProps> = ({ videoTitle, transcript, isLoading, onClose, error }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
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
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col text-white transform transition-all duration-300 scale-95 animate-scale-in"
      >
        <header className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold truncate pr-4" title={videoTitle}>Transcript: {videoTitle}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
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
