import React from 'react';
import type { DownloadRecord } from '../types';
import { formatDistanceToNow } from '../utils/timeFormatters';
import FileIcon from './icons/FileIcon';

interface DownloadHistoryProps {
  history: DownloadRecord[];
}

const DownloadHistory: React.FC<DownloadHistoryProps> = ({ history }) => {
  if (history.length === 0) {
    return null; // Don't render anything if there's no history
  }

  return (
    <div className="w-full max-w-7xl mt-12">
      <h2 className="text-2xl font-bold mb-4 text-white">Download History</h2>
      <div className="bg-gray-800 rounded-lg shadow-lg p-4">
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
              <p className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0">
                {formatDistanceToNow(record.downloadedAt)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DownloadHistory;
