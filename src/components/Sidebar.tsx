import React from 'react';
import { Music, Home, Search, Heart, BarChart3 } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'trending', label: 'Trending', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 to-black text-white p-6 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-gradient-to-br from-pink-500 to-red-500 p-3 rounded-lg">
          <Music className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
          MIRCHI
        </h1>
      </div>

      <nav className="space-y-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-12 pt-8 border-t border-gray-700">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Your Library</p>
        <div className="space-y-2">
          <div className="px-4 py-2 rounded bg-gray-800 text-sm text-gray-300 hover:text-white cursor-pointer transition">
            🎵 My Playlists
          </div>
          <div className="px-4 py-2 rounded bg-gray-800 text-sm text-gray-300 hover:text-white cursor-pointer transition">
            ❤️ Liked Songs
          </div>
        </div>
      </div>
    </aside>
  );
};
