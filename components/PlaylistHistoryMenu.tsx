import React from 'react';
import CollectionIcon from './icons/CollectionIcon';

interface PlaylistHistoryMenuProps {
  playlistGroups: Map<string, number>;
  selectedTopic: string | null;
  onSelectTopic: (topic: string | null) => void;
  totalCount: number;
}

const PlaylistHistoryMenu: React.FC<PlaylistHistoryMenuProps> = ({ playlistGroups, selectedTopic, onSelectTopic, totalCount }) => {
  const sortedPlaylists = Array.from(playlistGroups.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  const baseButtonClass = "w-full text-left p-3 rounded-lg flex justify-between items-center transition-colors duration-200";
  const inactiveClass = "hover:bg-gray-700";
  const activeClass = "bg-red-600 text-white font-semibold";

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
        <CollectionIcon className="w-6 h-6" />
        Downloaded Playlists
      </h2>
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => onSelectTopic(null)}
            className={`${baseButtonClass} ${selectedTopic === null ? activeClass : inactiveClass}`}
          >
            <span>All Downloads</span>
            <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${selectedTopic === null ? 'bg-red-800' : 'bg-gray-600 text-gray-200'}`}>{totalCount}</span>
          </button>
        </li>
        {sortedPlaylists.map(([topic, count]) => (
          <li key={topic}>
            <button
              onClick={() => onSelectTopic(topic)}
              className={`${baseButtonClass} ${selectedTopic === topic ? activeClass : inactiveClass}`}
            >
              <span className="truncate pr-2" title={topic}>{topic}</span>
              <span className={`text-xs font-bold rounded-full px-2 py-0.5 flex-shrink-0 ${selectedTopic === topic ? 'bg-red-800' : 'bg-gray-600 text-gray-200'}`}>{count}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlaylistHistoryMenu;