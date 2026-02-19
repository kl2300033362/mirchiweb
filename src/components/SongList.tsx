import React, { useState, useMemo } from 'react';
import { SongCard } from './SongCard';
import { SearchBar } from './SearchBar';
import { Song } from '../types';

interface SongListProps {
  songs: Song[];
  onSongSelect?: (song: Song) => void;
  filterGenre?: string;
}

export const SongList: React.FC<SongListProps> = ({ songs, onSongSelect, filterGenre }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSongs = useMemo(() => {
    let result = songs;

    if (filterGenre) {
      result = result.filter((song) => song.genre.toLowerCase() === filterGenre.toLowerCase());
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (song) =>
          song.title.toLowerCase().includes(query) ||
          song.artist.toLowerCase().includes(query) ||
          song.album.toLowerCase().includes(query)
      );
    }

    return result;
  }, [songs, searchQuery, filterGenre]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">
          {filterGenre ? `${filterGenre} Hits` : 'Popular Songs'}
        </h2>
        <SearchBar onSearch={setSearchQuery} />
      </div>

      {filteredSongs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-gray-400 text-lg">No songs found</p>
          <p className="text-gray-500 text-sm mt-2">Try different search terms or genre</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSongs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onPlay={onSongSelect || (() => {})}
              allSongs={songs}
            />
          ))}
        </div>
      )}
    </div>
  );
};
