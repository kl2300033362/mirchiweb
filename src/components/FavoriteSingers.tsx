import React, { useState } from 'react';
import { Heart, Music, ChevronRight } from 'lucide-react';

interface ArtistCardProps {
  name: string;
  image: string;
  genre: string;
  followers: string;
  isSelected: boolean;
  onToggle: (name: string) => void;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ name, image, genre, followers, isSelected, onToggle }) => {
  return (
    <div
      onClick={() => onToggle(name)}
      className={`cursor-pointer rounded-xl overflow-hidden transition-all transform hover:scale-105 ${
        isSelected ? 'ring-2 ring-pink-500 scale-105' : ''
      }`}
    >
      <div className="relative group">
        <img src={image} alt={name} className="w-full aspect-square object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
          <div className={`p-3 rounded-full ${isSelected ? 'bg-pink-500' : 'bg-gray-800 group-hover:bg-pink-500'} transition-all`}>
            <Heart className={`w-6 h-6 ${isSelected ? 'text-white fill-white' : 'text-white'}`} />
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-4">
        <p className="text-white font-semibold truncate">{name}</p>
        <p className="text-gray-400 text-sm truncate">{genre}</p>
        <p className="text-gray-500 text-xs mt-1">{followers} followers</p>
      </div>
    </div>
  );
};

interface FavoriteSingersProps {
  onContinue: (selectedArtists: string[]) => void;
}

export const FavoriteSingers: React.FC<FavoriteSingersProps> = ({ onContinue }) => {
  const [selectedArtists, setSelectedArtists] = useState<Set<string>>(new Set());

  const artists = [
    { name: 'The Weeknd', genre: 'Electronic/Pop', followers: '28.5M', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop' },
    { name: 'Drake', genre: 'Hip Hop', followers: '26.3M', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop' },
    { name: 'BTS', genre: 'K-Pop', followers: '24.1M', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop' },
    { name: 'Dua Lipa', genre: 'Pop', followers: '21.8M', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' },
    { name: 'Ariana Grande', genre: 'Pop', followers: '20.5M', image: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=300&h=300&fit=crop' },
    { name: 'Taylor Swift', genre: 'Pop', followers: '22.7M', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop' },
    { name: 'BLACKPINK', genre: 'K-Pop', followers: '19.3M', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop' },
    { name: 'Bad Bunny', genre: 'Latin/Reggaeton', followers: '23.4M', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop' },
    { name: 'Ed Sheeran', genre: 'Pop', followers: '18.9M', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' },
    { name: 'Eminem', genre: 'Hip Hop', followers: '17.2M', image: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=300&h=300&fit=crop' },
    { name: 'Post Malone', genre: 'Hip Hop/Pop', followers: '16.8M', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop' },
    { name: 'Billie Eilish', genre: 'Alternative Pop', followers: '15.6M', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop' },
    { name: 'Harry Styles', genre: 'Pop', followers: '14.9M', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop' },
    { name: 'Kendrick Lamar', genre: 'Hip Hop', followers: '14.3M', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' },
    { name: 'The Beatles', genre: 'Rock', followers: '13.7M', image: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=300&h=300&fit=crop' },
    { name: 'Queen', genre: 'Rock', followers: '12.5M', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop' },
  ];

  const toggleArtist = (name: string) => {
    const newSelected = new Set(selectedArtists);
    if (newSelected.has(name)) {
      newSelected.delete(name);
    } else {
      newSelected.add(name);
    }
    setSelectedArtists(newSelected);
  };

  const handleContinue = () => {
    onContinue(Array.from(selectedArtists));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black text-white p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-br from-pink-500 to-red-500 p-3 rounded-lg">
            <Music className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold">MIRCHI</h1>
        </div>

        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
            Favorite Singers
          </h2>
          <p className="text-gray-400 text-lg mb-2">Select your favorite artists to personalize your music experience</p>
          <p className="text-gray-500 text-sm">
            Selected: <span className="text-pink-500 font-semibold">{selectedArtists.size} artist{selectedArtists.size !== 1 ? 's' : ''}</span>
          </p>
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {artists.map((artist) => (
            <ArtistCard
              key={artist.name}
              {...artist}
              isSelected={selectedArtists.has(artist.name)}
              onToggle={toggleArtist}
            />
          ))}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={selectedArtists.size === 0}
            className={`flex items-center gap-2 px-8 py-4 rounded-lg font-semibold transition-all transform ${
              selectedArtists.size === 0
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-red-500 text-white hover:from-pink-600 hover:to-red-600 hover:scale-105 active:scale-95 shadow-lg'
            }`}
          >
            <span>Continue to MIRCHI</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {selectedArtists.size === 0 && (
          <p className="text-center text-gray-400 text-sm mt-4">Select at least one artist to continue</p>
        )}
      </div>
    </div>
  );
};
