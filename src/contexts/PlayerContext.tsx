import React, { createContext, useContext, useState, useCallback } from 'react';
import { Song, PlayerState } from '../types';

interface PlayerContextType extends PlayerState {
  playSong: (song: Song, queue?: Song[]) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  togglePlayPause: () => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  nextSong: () => void;
  prevSong: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    volume: 70,
    queue: [],
    currentIndex: 0,
  });

  const playSong = useCallback((song: Song, queue: Song[] = [song]) => {
    setPlayerState((prev) => ({
      ...prev,
      currentSong: song,
      isPlaying: true,
      queue,
      currentIndex: queue.findIndex((s) => s.id === song.id),
      currentTime: 0,
    }));
  }, []);

  const pauseSong = useCallback(() => {
    setPlayerState((prev) => ({
      ...prev,
      isPlaying: false,
    }));
  }, []);

  const resumeSong = useCallback(() => {
    setPlayerState((prev) => ({
      ...prev,
      isPlaying: true,
    }));
  }, []);

  const togglePlayPause = useCallback(() => {
    setPlayerState((prev) => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  }, []);

  const setCurrentTime = useCallback((time: number) => {
    setPlayerState((prev) => ({
      ...prev,
      currentTime: time,
    }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setPlayerState((prev) => ({
      ...prev,
      volume: Math.max(0, Math.min(100, volume)),
    }));
  }, []);

  const nextSong = useCallback(() => {
    setPlayerState((prev) => {
      const nextIndex = (prev.currentIndex + 1) % prev.queue.length;
      const nextSong = prev.queue[nextIndex];
      return {
        ...prev,
        currentSong: nextSong,
        currentIndex: nextIndex,
        currentTime: 0,
        isPlaying: true,
      };
    });
  }, []);

  const prevSong = useCallback(() => {
    setPlayerState((prev) => {
      const prevIndex = prev.currentIndex === 0 ? prev.queue.length - 1 : prev.currentIndex - 1;
      const prevSong = prev.queue[prevIndex];
      return {
        ...prev,
        currentSong: prevSong,
        currentIndex: prevIndex,
        currentTime: 0,
        isPlaying: true,
      };
    });
  }, []);

  const value: PlayerContextType = {
    ...playerState,
    playSong,
    pauseSong,
    resumeSong,
    togglePlayPause,
    setCurrentTime,
    setVolume,
    nextSong,
    prevSong,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};
