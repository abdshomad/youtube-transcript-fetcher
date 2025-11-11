import React from 'react';
import Spinner from './ui/Spinner';
import SparklesIcon from './icons/SparklesIcon';

interface PlaylistPreviewProps {
    topic: string;
    titles: string[];
    onConfirm: () => void;
    onCancel: () => void;
    isLoading: boolean;
}

const PlaylistPreview: React.FC<PlaylistPreviewProps> = ({ topic, titles, onConfirm, onCancel, isLoading }) => {
    return (
        <div className="w-full max-w-4xl mt-8 bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-1">Playlist Preview</h2>
            <p className="text-gray-400 mb-4">Here are the video titles we've generated for <span className="font-semibold text-gray-300">"{topic}"</span>. Happy with this list?</p>
            
            <ul className="space-y-3 list-decimal list-inside text-gray-300 mb-6 bg-gray-900 p-4 rounded-md">
                {titles.map((title, index) => (
                    <li key={index} className="pl-2">{title}</li>
                ))}
            </ul>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                    onClick={onCancel}
                    disabled={isLoading}
                    className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Spinner className="w-5 h-5" />
                            Generating...
                        </>
                    ) : (
                         <>
                            <SparklesIcon className="w-5 h-5" />
                            Generate Full Playlist
                        </>
                    )}
                </button>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default PlaylistPreview;
