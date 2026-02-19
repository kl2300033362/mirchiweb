import React from 'react';
import { Play, Heart } from 'lucide-react';
import { Song } from '../types';
import { usePlayer } from '../contexts/PlayerContext';

interface SongCardProps {
  song: Song;
  onPlay: (song: Song) => void;
  allSongs?: Song[];
}

export const SongCard: React.FC<SongCardProps> = ({ song, onPlay, allSongs = [] }) => {
  const [isFavorite, setIsFavorite] = React.useState(false);
  const { playSong } = usePlayer();

  const handlePlay = () => {
    playSong(song, allSongs.length > 0 ? allSongs : [song]);
    onPlay(song);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 hover:bg-gray-700 transition-all group cursor-pointer">
      <div className="relative mb-4">
        <img
          src={song.cover_image_url}
          alt={song.title}
          className="w-full aspect-square object-cover rounded-lg shadow-lg group-hover:shadow-2xl transition-shadow"
        />
        <button
          onClick={handlePlay}
          className="absolute bottom-2 right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:from-pink-600 hover:to-red-600"
        >
          <Play className="w-5 h-5 fill-white" />
        </button>
      </div>

      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1">
          <p className="text-white font-semibold text-sm truncate mb-1">{song.title}</p>
          <p className="text-gray-400 text-xs truncate">{song.artist}</p>
          <p className="text-gray-500 text-xs mt-1">{song.album}</p>
        </div>
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className={`ml-2 transition-colors flex-shrink-0 ${
            isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        <span className="inline-block bg-gray-700 px-2 py-1 rounded">{song.genre}</span>
      </div>
    </div>
  );
};
