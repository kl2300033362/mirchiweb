-- MusicStream Database Schema
-- Run this migration in Supabase

-- Songs table
CREATE TABLE IF NOT EXISTS public.songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  duration INTEGER,
  genre TEXT,
  release_year INTEGER,
  audio_url TEXT,
  cover_image_url TEXT,
  plays INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS on songs
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read" ON public.songs
  FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX idx_songs_genre ON public.songs(genre);
CREATE INDEX idx_songs_artist ON public.songs(artist);
CREATE INDEX idx_songs_title ON public.songs USING GIN(to_tsvector('english', title));

-- Playlists table
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS on playlists
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- Users can read their own playlists
CREATE POLICY "Users can read their own playlists" ON public.playlists
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

-- Users can create playlists
CREATE POLICY "Users can create playlists" ON public.playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own playlists
CREATE POLICY "Users can update their own playlists" ON public.playlists
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own playlists
CREATE POLICY "Users can delete their own playlists" ON public.playlists
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_playlists_user_id ON public.playlists(user_id);

-- Playlist Songs junction table
CREATE TABLE IF NOT EXISTS public.playlist_songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(playlist_id, song_id)
);

-- Enable RLS on playlist_songs
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;

-- Users can read playlist songs (if playlist is theirs or public)
CREATE POLICY "Users can read playlist songs" ON public.playlist_songs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE id = playlist_id AND (auth.uid() = user_id OR is_public = true)
    )
  );

-- Users can insert songs to their playlists
CREATE POLICY "Users can add songs to their playlists" ON public.playlist_songs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE id = playlist_id AND auth.uid() = user_id
    )
  );

CREATE INDEX idx_playlist_songs_playlist_id ON public.playlist_songs(playlist_id);
CREATE INDEX idx_playlist_songs_song_id ON public.playlist_songs(song_id);

-- User Favorites table
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, song_id)
);

-- Enable RLS on user_favorites
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Users can read their own favorites
CREATE POLICY "Users can read their own favorites" ON public.user_favorites
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create favorites
CREATE POLICY "Users can create favorites" ON public.user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites" ON public.user_favorites
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);

-- Play History table
CREATE TABLE IF NOT EXISTS public.play_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS on play_history
ALTER TABLE public.play_history ENABLE ROW LEVEL SECURITY;

-- Users can read their own history
CREATE POLICY "Users can read their own history" ON public.play_history
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create history entries
CREATE POLICY "Users can create history entries" ON public.play_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_play_history_user_id ON public.play_history(user_id);
CREATE INDEX idx_play_history_played_at ON public.play_history(played_at DESC);

-- Sample data (optional)
INSERT INTO public.songs (title, artist, album, duration, genre, release_year, cover_image_url) VALUES
  ('Midnight City', 'M83', 'Hurry Up, We''re Dreaming', 244, 'Electronic', 2011, 'https://via.placeholder.com/300'),
  ('Take Me Out', 'Franz Ferdinand', 'Franz Ferdinand', 295, 'Rock', 2004, 'https://via.placeholder.com/300'),
  ('Do You Want to Know a Secret', 'The Beatles', 'Please Please Me', 131, 'Rock', 1963, 'https://via.placeholder.com/300'),
  ('Hotel California', 'Eagles', 'Hotel California', 391, 'Rock', 1976, 'https://via.placeholder.com/300'),
  ('Bohemian Rhapsody', 'Queen', 'A Night at the Opera', 354, 'Rock', 1975, 'https://via.placeholder.com/300'),
  ('Stairway to Heaven', 'Led Zeppelin', 'Led Zeppelin IV', 482, 'Rock', 1971, 'https://via.placeholder.com/300'),
  ('Blinding Lights', 'The Weeknd', 'After Hours', 200, 'Electronic', 2019, 'https://via.placeholder.com/300'),
  ('Levitating', 'Dua Lipa', 'Future Nostalgia', 203, 'Pop', 2020, 'https://via.placeholder.com/300'),
  ('Good as Hell', 'Lizzo', 'Cuz I Love You', 174, 'Pop', 2019, 'https://via.placeholder.com/300'),
  ('Shape of You', 'Ed Sheeran', 'Divide', 234, 'Pop', 2017, 'https://via.placeholder.com/300')
ON CONFLICT DO NOTHING;
