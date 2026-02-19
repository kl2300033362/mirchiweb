import { useState } from 'react';
import { Sidebar, Player, SongList, Header, Login, FavoriteSingers, PersonalDetails } from './components';
import { PlayerProvider } from './contexts/PlayerContext';
import { SAMPLE_SONGS } from './data/songs';
import './App.css';

type PageType = 'login' | 'favorites' | 'app';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('login');
  const [activeTab, setActiveTab] = useState('home');

  const handleLogin = (_email: string, _password: string) => {
    setCurrentPage('favorites');
  };

  const handleFavoritesSelected = (_artists: string[]) => {
    setCurrentPage('app');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <Header title="Welcome to MIRCHI" subtitle="Discover your favorite music" />
            <SongList songs={SAMPLE_SONGS} />
          </>
        );
      case 'trending':
        return (
          <>
            <Header title="Trending Now" subtitle="Most played songs this week" />
            <SongList songs={SAMPLE_SONGS.slice(0, 20)} />
          </>
        );
      case 'favorites':
        return (
          <>
            <Header title="Your Favorites" subtitle="Songs you loved" />
            <SongList songs={SAMPLE_SONGS.slice(0, 25)} />
          </>
        );
      case 'search':
        return (
          <>
            <Header title="Search Music" subtitle="Find your next favorite track" />
            <SongList songs={SAMPLE_SONGS} />
          </>
        );
      case 'personal-details':
        return (
          <>
            <Header title="Personal Details" subtitle="View and edit your profile information" />
            <PersonalDetails />
          </>
        );
      default:
        return null;
    }
  };

  // Login Page
  if (currentPage === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  // Favorite Singers Page
  if (currentPage === 'favorites') {
    return <FavoriteSingers onContinue={handleFavoritesSelected} />;
  }

  // Main App
  return (
    <PlayerProvider>
      <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-32">
          <div className="p-8 max-w-7xl mx-auto">{renderContent()}</div>
        </main>

        {/* Player */}
        <Player songs={SAMPLE_SONGS} />
      </div>
    </PlayerProvider>
  );
}

export default App;
