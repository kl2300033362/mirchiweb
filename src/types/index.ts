export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  genre: string;
  cover_image_url: string;
  audio_url?: string;
  plays?: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  cover_image_url?: string;
  songs?: Song[];
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  queue: Song[];
  currentIndex: number;
}
