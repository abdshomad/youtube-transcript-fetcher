
import React from 'react';
import type { Video } from '../types';
import DownloadIcon from './icons/DownloadIcon';
import Spinner from './ui/Spinner';
import SaveIcon from './icons/SaveIcon';
import XCircleIcon from './icons/XCircleIcon';

interface VideoCardProps {
    video: Video;
    onGetTranscript: (video: Video) => void;
    isLoading: boolean;
    isSelected: boolean;
    onToggleSelect: (videoId: string) => void;
    isSelectedForBatch: boolean;
    batchStatus?: 'pending' | 'success' | 'error';
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onGetTranscript, isLoading, isSelected, onToggleSelect, isSelectedForBatch, batchStatus }) => {
    
    const handleSelect = () => {
        if (batchStatus) return; // Don't allow toggling during processing
        onToggleSelect(video.id);
    };
    
    return (
        <div className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 flex flex-col relative ${
                isSelectedForBatch ? 'ring-2 ring-red-500' : 'hover:scale-105'
            }`}>
            
            {!batchStatus && (
                 <label 
                    htmlFor={`select-${video.id}`} 
                    className="absolute top-2 left-2 z-10 w-6 h-6 bg-gray-900 bg-opacity-70 rounded-md flex items-center justify-center cursor-pointer border-2 border-gray-500 hover:border-red-500"
                    onClick={(e) => e.stopPropagation()}
                >
                    <input 
                        id={`select-${video.id}`}
                        type="checkbox" 
                        checked={isSelectedForBatch} 
                        onChange={handleSelect}
                        className="opacity-0 absolute h-0 w-0"
                    />
                    {isSelectedForBatch && <SaveIcon className="w-5 h-5 text-red-500" />}
                </label>
            )}

            {batchStatus && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-20 p-4 text-center">
                    {batchStatus === 'pending' && <Spinner className="w-8 h-8 text-white" />}
                    {batchStatus === 'success' && <SaveIcon className="w-10 h-10 text-green-500" />}
                    {batchStatus === 'error' && <XCircleIcon className="w-10 h-10 text-red-500" />}
                    <p className="text-white mt-2 font-semibold capitalize">{batchStatus === 'pending' ? 'Generating...' : batchStatus}</p>
                </div>
            )}

            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-40 object-cover cursor-pointer" onClick={handleSelect} />
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-white font-semibold text-md mb-1 leading-tight flex-grow cursor-pointer" onClick={handleSelect}>{video.title}</h3>
                <p className="text-gray-400 text-sm mb-4 cursor-pointer" onClick={handleSelect}>{video.channelName}</p>
                <button
                    onClick={() => onGetTranscript(video)}
                    disabled={isLoading || isSelectedForBatch}
                    className="mt-auto w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-900 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300 flex items-center justify-center gap-2"
                >
                   {isSelected && isLoading ? 'Loading...' : <><DownloadIcon className="w-5 h-5" /> Get Transcript</>}
                </button>
            </div>
        </div>
    );
};

export default VideoCard;
