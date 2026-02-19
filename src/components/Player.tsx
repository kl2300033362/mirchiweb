import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { Song } from '../types';

interface PlayerProps {
  songs?: Song[];
}

export const Player: React.FC<PlayerProps> = ({ songs = [] }) => {
  const { currentSong, isPlaying, volume, setVolume, togglePlayPause, nextSong, prevSong, playSong } = usePlayer();
  const [isFavorite, setIsFavorite] = useState(false);

  // Auto-play first song if available and no song is selected
  useEffect(() => {
    if (!currentSong && songs.length > 0) {
      playSong(songs[0], songs);
    }
  }, [songs, currentSong, playSong]);

  if (!currentSong) {
    return (
      <div className="bg-gradient-to-r from-gray-900 to-black border-t border-gray-700 p-4">
        <div className="flex items-center justify-center h-20">
          <p className="text-gray-500">Select a song to start playing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-black border-t border-gray-700 backdrop-blur-lg">
      {/* Progress Bar */}
      <div className="h-1 bg-gray-700">
        <div className="h-full bg-gradient-to-r from-pink-500 to-red-500" style={{ width: '0%' }}></div>
      </div>

      {/* Player Content */}
      <div className="p-4 px-6">
        <div className="flex items-center gap-6 max-w-7xl mx-auto">
          {/* Song Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <img
              src={currentSong.cover_image_url}
              alt={currentSong.title}
              className="w-14 h-14 rounded-lg object-cover flex-shrink-0 shadow-lg"
            />
            <div className="min-w-0">
              <p className="text-white font-semibold truncate">{currentSong.title}</p>
              <p className="text-gray-400 text-sm truncate">{currentSong.artist}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
            >
              <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={prevSong}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlayPause}
                className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-3 rounded-full hover:from-pink-600 hover:to-red-600 transition-all transform hover:scale-105"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <button
                onClick={nextSong}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3 w-48">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <span className="text-gray-400 text-xs w-8 text-right">{volume}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
