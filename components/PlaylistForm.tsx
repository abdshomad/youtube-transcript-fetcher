import React from 'react';
import Spinner from './ui/Spinner';

interface PlaylistFormProps {
    url: string;
    setUrl: (url: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
}

const PlaylistForm: React.FC<PlaylistFormProps> = ({ url, setUrl, onSubmit, isLoading }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl">
            <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter YouTube playlist URL or a topic (e.g., 'Beginner Python')"
                className="flex-grow bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 outline-none"
                disabled={isLoading}
            />
            <button
                type="submit"
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
                {isLoading ? <Spinner /> : 'Preview Playlist'}
            </button>
        </form>
    );
};

export default PlaylistForm;