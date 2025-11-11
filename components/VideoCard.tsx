
import React from 'react';
import type { Video } from '../types';
import DownloadIcon from './icons/DownloadIcon';

interface VideoCardProps {
    video: Video;
    onGetTranscript: (video: Video) => void;
    isLoading: boolean;
    isSelected: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onGetTranscript, isLoading, isSelected }) => {
    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 flex flex-col">
            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-40 object-cover" />
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-white font-semibold text-md mb-1 leading-tight flex-grow">{video.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{video.channelName}</p>
                <button
                    onClick={() => onGetTranscript(video)}
                    disabled={isLoading}
                    className="mt-auto w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-900 disabled:cursor-wait text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300 flex items-center justify-center gap-2"
                >
                   {isSelected && isLoading ? 'Loading...' : <><DownloadIcon className="w-5 h-5" /> Get Transcript</>}
                </button>
            </div>
        </div>
    );
};

export default VideoCard;
