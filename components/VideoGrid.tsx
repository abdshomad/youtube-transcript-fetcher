
import React from 'react';
import type { Video } from '../types';
import VideoCard from './VideoCard';
import Skeleton from './ui/Skeleton';

interface VideoGridProps {
    videos: Video[];
    onGetTranscript: (video: Video) => void;
    isLoading: boolean;
    loadingTranscriptFor: string | null;
    selectedVideoIds: Set<string>;
    onToggleVideoSelection: (videoId: string) => void;
    batchItemStatus: Record<string, 'pending' | 'success' | 'error'>;
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos, onGetTranscript, isLoading, loadingTranscriptFor, selectedVideoIds, onToggleVideoSelection, batchItemStatus }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-7xl mt-8">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg overflow-hidden">
                        <Skeleton className="w-full h-40" />
                        <div className="p-4">
                            <Skeleton className="h-5 w-full mb-2" />
                            <Skeleton className="h-4 w-3/4 mb-4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    
    if (videos.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-7xl mt-8">
            {videos.map((video) => (
                <VideoCard
                    key={video.id}
                    video={video}
                    onGetTranscript={onGetTranscript}
                    isLoading={!!loadingTranscriptFor}
                    isSelected={loadingTranscriptFor === video.id}
                    isSelectedForBatch={selectedVideoIds.has(video.id)}
                    onToggleSelect={onToggleVideoSelection}
                    batchStatus={batchItemStatus[video.id]}
                />
            ))}
        </div>
    );
};

export default VideoGrid;
