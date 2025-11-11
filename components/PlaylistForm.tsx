import React from 'react';
import Spinner from './ui/Spinner';

interface PlaylistFormProps {
    url: string;
    setUrl: (url: string) => void;
    topic: string;
    setTopic: (topic: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
}

const PlaylistForm: React.FC<PlaylistFormProps> = ({ url, setUrl, topic, setTopic, onSubmit, isLoading }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUrl = e.target.value;
        setUrl(newUrl);
        if (newUrl) {
            setTopic('');
        }
    };

    const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTopic = e.target.value;
        setTopic(newTopic);
        if (newTopic) {
            setUrl('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-2xl">
            <input
                type="text"
                value={url}
                onChange={handleUrlChange}
                placeholder="Enter YouTube playlist URL"
                className="flex-grow bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 outline-none"
                disabled={isLoading}
                aria-label="YouTube Playlist URL"
            />
            
            <div className="flex items-center gap-4">
                <hr className="flex-grow border-t border-gray-700" />
                <span className="text-gray-400 text-sm font-medium">OR</span>
                <hr className="flex-grow border-t border-gray-700" />
            </div>

            <input
                type="text"
                value={topic}
                onChange={handleTopicChange}
                placeholder="Search for a topic (e.g., 'Beginner Python')"
                className="flex-grow bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 outline-none"
                disabled={isLoading}
                aria-label="Search topic"
            />

            <button
                type="submit"
                disabled={isLoading || (!url.trim() && !topic.trim())}
                className="mt-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
                {isLoading ? <Spinner /> : 'Fetch Playlist'}
            </button>
        </form>
    );
};

export default PlaylistForm;
