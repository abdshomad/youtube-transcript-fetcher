import React from 'react';
import type { DownloadRecord } from '../types';
import { formatDistanceToNow } from '../utils/timeFormatters';
import FileIcon from './icons/FileIcon';
import RedownloadIcon from './icons/RedownloadIcon';
import Spinner from './ui/Spinner';

interface DownloadHistoryProps {
  history: DownloadRecord[];
  onRedownload: (record: DownloadRecord) => void;
  redownloadingId: string | null;
  activePlaylistTopic: string | null;
}

const DownloadHistory: React.FC<DownloadHistoryProps> = ({ history, onRedownload, redownloadingId, activePlaylistTopic }) => {
  const title = activePlaylistTopic ? `History for "${activePlaylistTopic}"` : "All Downloads";

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4 text-white truncate" title={title}>{title}</h2>
      <div className="bg-gray-800 rounded-lg shadow-lg p-4">
        {history.length > 0 ? (
          <ul className="divide-y divide-gray-700">
            {history.map((record) => (
              <li key={record.id} className="py-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 min-w-0">
                  <FileIcon className="w-8 h-8 text-red-500 flex-shrink-0" />
                  <div className="min-w-0">
                      <p className="font-semibold text-white truncate" title={record.videoTitle}>
                          {record.videoTitle}
                      </p>
                      <p className="text-sm text-gray-400 truncate" title={record.fileName}>
                          {record.fileName}
                      </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0">
                    {formatDistanceToNow(record.downloadedAt)}
                  </p>
                  <button
                      onClick={() => onRedownload(record)}
                      disabled={!!redownloadingId}
                      className="p-1 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                      aria-label="Re-download transcript"
                      title="Re-download"
                  >
                      {redownloadingId === record.id ? <Spinner className="w-5 h-5" /> : <RedownloadIcon className="w-5 h-5" />}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
           <p className="text-center text-gray-400 py-8">
            No downloads to display for this selection.
          </p>
        )}
      </div>
    </div>
  );
};

export default DownloadHistory;