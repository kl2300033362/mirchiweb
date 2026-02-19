# MusicStream - Full Deployment Guide

A complete Spotify-like music streaming application with frontend, backend API, database, Docker support, and Kubernetes deployment.

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│           Frontend (React + TypeScript)     │
│  - Music browsing & search                  │
│  - Playlist management                      │
│  - Player controls                          │
│  - Genre filtering                          │
└──────────────┬──────────────────────────────┘
               │
        ┌──────▼──────┐
        │   Nginx     │
        │  (Static)   │
        └──────┬──────┘
               │
        ┌──────▼──────────┐
        │  Edge Functions │
        │  (Deno/API)     │
        └──────┬──────────┘
               │
               ▼
        ┌─────────────────┐
        │    Supabase     │
        │   (Database)    │
        │  - Songs        │
        │  - Playlists    │
        │  - Favorites    │
        │  - Play History │
        └─────────────────┘
```

## Features

- Browse all available songs
- Search songs by title, artist, or album
- Filter songs by genre
- Create and manage playlists
- Mark favorite songs
- Full-featured music player with controls
- Responsive design for all devices
- Auto-scaling in Kubernetes
- Production-ready Docker images

## Technology Stack

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- Lucide Icons
- Vite (Build tool)
- Supabase JS Client

**Backend:**
- Supabase Edge Functions (Deno)
- PostgreSQL Database
- Row Level Security (RLS)

**Deployment:**
- Docker & Docker Compose
- Kubernetes
- Nginx for static serving

## Local Development Setup

### Prerequisites
- Node.js 18+
- npm/yarn

### Installation

```bash
# Clone repository
git clone <repo-url>
cd music-stream

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your Supabase credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running Locally

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Docker Deployment

### Build Images

```bash
# Frontend image
docker build -t music-app-frontend:latest .

# API image (Edge Functions)
docker build -f supabase/functions/Dockerfile -t music-app-api:latest supabase/functions/
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access the application at `http://localhost`

## Kubernetes Deployment

### Prerequisites
- kubectl installed
- Access to a Kubernetes cluster
- Docker images pushed to a registry

### Quick Deploy

```bash
# 1. Update secrets with your credentials
vim k8s/secret.yaml

# 2. Apply all Kubernetes manifests
kubectl apply -f k8s/

# 3. Get the frontend service IP
kubectl get svc music-frontend-service

# 4. Access the application
# Either via LoadBalancer IP or configure ingress
```

### Detailed Instructions

See `k8s/README.md` for comprehensive Kubernetes deployment guide.

## Database Schema

### Tables

**songs**
- id (uuid) - Primary key
- title (text) - Song title
- artist (text) - Artist name
- album (text) - Album name
- duration (integer) - Duration in seconds
- audio_url (text) - URL to audio file
- cover_image_url (text) - Album cover URL
- genre (text) - Music genre
- release_year (integer) - Release year
- plays (integer) - Play count

**playlists**
- id (uuid) - Primary key
- user_id (uuid) - User ID (foreign key)
- name (text) - Playlist name
- description (text) - Playlist description
- is_public (boolean) - Public/private flag
- cover_image_url (text) - Playlist cover

**playlist_songs**
- id (uuid) - Primary key
- playlist_id (uuid) - Playlist ID (foreign key)
- song_id (uuid) - Song ID (foreign key)
- position (integer) - Song order
- added_at (timestamp) - When added

**user_favorites**
- id (uuid) - Primary key
- user_id (uuid) - User ID (foreign key)
- song_id (uuid) - Song ID (foreign key)

**play_history**
- id (uuid) - Primary key
- user_id (uuid) - User ID (foreign key)
- song_id (uuid) - Song ID (foreign key)
- played_at (timestamp) - When played

## API Endpoints

### Songs
- `GET /music-api/songs` - Get all songs
- `GET /music-api/songs?genre=Jazz` - Filter by genre
- `GET /music-api/songs?search=query` - Search songs
- `GET /music-api/songs/{id}` - Get single song
- `GET /music-api/genres` - Get all genres

### Playlists
- `GET /music-api/playlists` - Get playlists
- `POST /music-api/playlists` - Create playlist
- `GET /music-api/playlists/{id}/songs` - Get playlist songs

### Favorites
- `GET /music-api/favorites` - Get favorite songs

## Project Structure

```
music-stream/
├── src/
│   ├── components/           # React components
│   │   ├── Player.tsx       # Music player
│   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   ├── SongList.tsx     # Song grid
│   │   └── SearchBar.tsx    # Search input
│   ├── contexts/            # React contexts
│   │   └── PlayerContext.tsx # Player state management
│   ├── lib/
│   │   └── supabase.ts      # Supabase client
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Styles
├── supabase/
│   └── functions/
│       ├── music-api/
│       │   └── index.ts     # Edge function
│       └── Dockerfile       # API container
├── k8s/                     # Kubernetes manifests
├── Dockerfile               # Frontend container
├── docker-compose.yml       # Docker Compose config
└── package.json            # Dependencies
```

## Deployment Checklist

- [ ] Update Supabase credentials in `.env.example`
- [ ] Configure database schema (run migrations)
- [ ] Build Docker images
- [ ] Push images to registry
- [ ] Update Kubernetes secrets
- [ ] Deploy to Kubernetes cluster
- [ ] Configure domain/DNS for ingress
- [ ] Enable HTTPS (SSL certificate)
- [ ] Monitor logs and metrics
- [ ] Setup CI/CD pipeline

## Performance Optimization

- Frontend: 145KB gzipped bundle
- Nginx: Static asset caching enabled
- Database: Indexes on frequently queried columns
- Auto-scaling: Configured via HPA
- CDN: Deploy images to CDN for faster delivery

## Security Features

- Row Level Security (RLS) enabled on all tables
- API key validation
- CORS configured
- Environment variables for secrets
- No sensitive data in client-side code

## Troubleshooting

### Build Issues
```bash
npm run build
npm run typecheck
npm run lint
```

### Docker Issues
```bash
docker logs music-frontend
docker logs music-api
```

### Kubernetes Issues
See `k8s/README.md` for detailed troubleshooting guide.

## Support

For issues or questions, refer to:
- Supabase Documentation: https://supabase.com/docs
- Kubernetes Docs: https://kubernetes.io/docs
- Docker Docs: https://docs.docker.com
