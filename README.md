# Mirchi Web

Mirchi Web is a Spotify-style music web app built with React, TypeScript, and Tailwind CSS.  
It includes a modern frontend UI, an API layer using Supabase Edge Functions (Deno), Docker support, and Kubernetes manifests.

## What this project includes

- Interactive music player UI (home, trending, favorites, search views)
- Login and favorite-artist selection flow
- Reusable React component architecture
- Supabase-backed API function for songs, genres, playlists, and favorites
- Docker setup for frontend and API
- Kubernetes manifests for API service, ingress, and autoscaling

## Tech stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Vite
- Lucide React Icons

### Backend/API
- Supabase Edge Functions
- Deno runtime
- Supabase REST endpoints

### Deployment
- Docker / Docker Compose
- Kubernetes (manifests in `k8s/`)
- Nginx (for static frontend serving)

## Project structure

```
Mirchi-web/
├── src/
│   ├── components/            # UI components (player, sidebar, cards, etc.)
│   ├── contexts/              # React context (player state)
│   ├── data/                  # Local sample songs data
│   ├── types/                 # TypeScript types
│   ├── App.tsx                # Main app flow
│   └── main.tsx               # App entry point
├── supabase/
│   ├── functions/music-api/   # Deno API function
│   └── migrations/            # SQL schema migration
├── k8s/                       # Kubernetes manifests
├── Dockerfile                 # Frontend image build
├── docker-compose.yml         # Multi-service local container setup
└── DEPLOYMENT.md              # Full deployment notes
```

## Environment variables

Create `.env` from `.env.example` and set:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

Notes:
- `VITE_*` values are used by the frontend at build/runtime.
- `SUPABASE_*` values are used by the API function container.

## Local development

### Prerequisites
- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

### Useful scripts

```bash
npm run build       # production build
npm run preview     # preview built app locally
npm run lint        # eslint checks
npm run typecheck   # TypeScript type checks
```

## Docker usage

### Build and run all services

```bash
docker-compose up -d --build
```

### Stop services

```bash
docker-compose down
```

Services exposed by default:
- Frontend: `http://localhost` (port 80)
- API: `http://localhost:8000`

## API endpoints (Edge Function)

Base service runs from `supabase/functions/music-api/index.ts` and exposes:

- `GET /health` → health status
- `GET /songs?genre=&search=&limit=&offset=` → filtered/paginated songs
- `GET /songs/:id` → single song by id
- `GET /genres` → unique genres
- `GET /playlists?user_id=` → playlists (optionally by user)
- `POST /playlists` → create playlist
- `GET /playlists/:id/songs` → songs inside playlist
- `POST /playlists/:id/songs` → add song to playlist
- `DELETE /playlists/:id/songs/:song_id` → remove song from playlist
- `GET /favorites?user_id=` → user favorites with song details
- `POST /favorites` → add favorite song
- `DELETE /favorites?user_id=&song_id=` → remove favorite song

### Backend request examples

Create playlist:

```json
{
	"user_id": "<uuid>",
	"name": "Road Trip",
	"description": "Songs for travel",
	"is_public": true
}
```

Add song to playlist:

```json
{
	"song_id": "<uuid>",
	"position": 1
}
```

Add favorite:

```json
{
	"user_id": "<uuid>",
	"song_id": "<uuid>"
}
```

Supported API prefixes:
- `/songs`, `/playlists`, etc. (direct function access)
- `/api/...` (for ingress/proxy style routing)
- `/music-api/...` (legacy prefixed routing)

## Kubernetes

Available manifests in `k8s/`:
- `api-deployment.yaml`
- `api-service.yaml`
- `hpa.yaml`
- `ingress.yaml`

Apply manifests:

```bash
kubectl apply -f k8s/
```

See `k8s/README.md` and `DEPLOYMENT.md` for deployment guidance and production checklist.

## Troubleshooting

### Build/type/lint checks

```bash
npm run build
npm run typecheck
npm run lint
```

### Docker logs

```bash
docker-compose logs -f
```

## Current status notes

- This repository includes API and frontend infrastructure files.
- Some Kubernetes manifests reference frontend resources (`music-frontend-service`, `music-frontend`) that should exist in cluster manifests for full ingress/HPA setup.
- Use `DEPLOYMENT.md` for broader infrastructure planning and hardening steps.
