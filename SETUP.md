# Audio Sync Platform - Setup Guide

## Overview

The Audio Sync Platform is a low-latency audio streaming system with timestamp-based synchronization capabilities. It ingests external audio streams, generates HLS segments, indexes them with precise timestamps, and serves them through a React-based player.

## Architecture

```
┌─────────────────┐
│  BBC World      │
│  Service Stream │
└────────┬────────┘
         │
         v
┌─────────────────┐      ┌──────────────┐
│ FFmpeg Worker   │─────>│ HLS Storage  │
│ (Stream Ingest) │      │ /storage/hls │
└─────────────────┘      └──────┬───────┘
                                │
                                v
                         ┌──────────────┐      ┌───────────────┐
                         │   Indexer    │─────>│  SQLite Index │
                         │   Worker     │      │ /storage/index│
                         └──────────────┘      └───────────────┘
                                                       │
                         ┌─────────────────────────────┘
                         v
                  ┌──────────────┐
                  │  NestJS API  │
                  │  (Backend)   │
                  └──────┬───────┘
                         │
                         v
                  ┌──────────────┐
                  │  Next.js 16  │
                  │  (Frontend)  │
                  └──────────────┘
```

## Components

### 1. FFmpeg Worker
- **Technology**: FFmpeg in Docker container
- **Purpose**: Ingests external audio stream and generates HLS segments
- **Output**: 2-second HLS segments in MPEG-TS format
- **Target Latency**: <6 seconds

### 2. Indexer Worker
- **Technology**: Node.js 20 + TypeScript + better-sqlite3 + chokidar
- **Purpose**: Monitors HLS directory and builds timestamp index
- **Database**: SQLite with segment metadata (sequence, filename, timestamps)
- **Mechanism**: File system watcher (chokidar) for real-time indexing

### 3. Backend API
- **Technology**: NestJS 10 + Fastify + SQLite
- **Purpose**: Serves HLS playlist, segments, and provides timestamp query API
- **Port**: 4000
- **Architecture**: Domain-driven design (DDD) with modular structure

### 4. Frontend Player
- **Technology**: Next.js 16 + React 19 + hls.js + TypeScript
- **Purpose**: Low-latency audio player with controls
- **Port**: 3030
- **Features**: Play/pause, seek, timeline scrubbing

## Prerequisites

### Required
- **Docker**: 20.10+ with Docker Compose V2
- **Docker Compose**: V2.0+
- **Disk Space**: ~500MB for images + storage for HLS segments
- **Network**: Internet access to pull Docker images and stream source

### Optional (for local development)
- **Node.js**: 20.x LTS
- **pnpm**: 8.x or higher
- **FFmpeg**: 6.x (if running FFmpeg worker locally)

## Repository Structure

```
applications/
├── docker-compose.yml          # Service orchestration
├── .env.example                # Environment template
├── SETUP.md                    # This file
├── RUN.md                      # Runtime instructions
│
├── streaming/
│   ├── ffmpeg-worker/          # FFmpeg container
│   │   ├── Dockerfile
│   │   ├── entrypoint.sh
│   │   └── .dockerignore
│   │
│   └── indexer/                # Indexer worker
│       ├── Dockerfile
│       ├── package.json
│       ├── tsconfig.json
│       ├── src/
│       │   └── index.ts        # Main indexer logic
│       └── .dockerignore
│
├── backend/                    # NestJS API
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   └── domains/
│   │       ├── hls/            # HLS serving module
│   │       └── index/          # Index query module
│   └── .dockerignore
│
├── frontend/                   # Next.js player
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── app/
│   │   ├── page.tsx
│   │   └── player/
│   │       ├── page.tsx
│   │       ├── components/
│   │       │   └── AudioPlayer.tsx
│   │       └── hooks/
│   │           ├── useHls.ts
│   │           └── usePlayer.ts
│   └── .dockerignore
│
└── storage/                    # Persistent data
    ├── hls/                    # HLS segments (volatile)
    └── index/                  # SQLite database (persistent)
        └── segments.db
```

## Environment Variables

### FFmpeg Worker
```bash
STREAM_URL=http://stream.live.vc.bbcmedia.co.uk/bbc_world_service
HLS_TIME=2                      # Segment duration in seconds
HLS_LIST_SIZE=10                # Number of segments in playlist
```

### Indexer Worker
```bash
HLS_PATH=/storage/hls           # Path to HLS segments
INDEX_DB_PATH=/storage/index/segments.db
SEGMENT_DURATION=2              # Expected segment duration
NODE_ENV=production
```

### Backend API
```bash
NODE_ENV=development
PORT=4000
STORAGE_PATH=/storage
INDEX_DB_PATH=/storage/index/segments.db
CORS_ORIGIN=http://localhost:3030
```

### Frontend
```bash
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Initial Setup

### 1. Clone and Navigate
```bash
cd /path/to/project/applications
```

### 2. Create Environment File (Optional)
```bash
cp .env.example .env
# Edit .env if you need to customize stream URL or ports
```

### 3. Create Storage Directories
Storage directories are created automatically by Docker, but you can create them manually:
```bash
mkdir -p storage/hls storage/index
chmod -R 777 storage/
```

### 4. Verify Docker Installation
```bash
docker --version
docker compose version
```

Expected output:
```
Docker version 24.0.0+
Docker Compose version v2.20.0+
```

## Configuration Options

### Change Stream Source
Edit `docker-compose.yml`:
```yaml
services:
  ffmpeg-worker:
    environment:
      - STREAM_URL=https://your-stream-url.com/stream
```

### Adjust Segment Duration
For different latency requirements:
```yaml
services:
  ffmpeg-worker:
    environment:
      - HLS_TIME=4              # 4-second segments (lower bitrate overhead)
      - HLS_LIST_SIZE=15        # Keep more segments

  indexer:
    environment:
      - SEGMENT_DURATION=4      # Must match FFmpeg HLS_TIME
```

**Latency Impact**:
- 2s segments = ~4-6s latency (current)
- 4s segments = ~8-12s latency (more stable)
- 6s segments = ~12-18s latency (production stable)

### Change Frontend Port
Edit `docker-compose.yml`:
```yaml
services:
  frontend:
    ports:
      - "8080:3000"             # Access on port 8080

  backend:
    environment:
      - CORS_ORIGIN=http://localhost:8080
```

### Enable Debug Logging

**FFmpeg Worker**:
```bash
docker logs -f audio-sync-ffmpeg
```

**Indexer Worker**:
Edit `streaming/indexer/src/index.ts` and rebuild.

**Backend**:
Set `LOG_LEVEL=debug` in docker-compose.yml.

**Frontend**:
Edit `frontend/app/player/hooks/useHls.ts`:
```typescript
const hls = new Hls({
  debug: true,  // Enable HLS.js debug logs
  // ...
});
```

## Database Schema

The indexer creates this SQLite schema:

```sql
CREATE TABLE segments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sequence INTEGER NOT NULL UNIQUE,
  filename TEXT NOT NULL,
  start REAL NOT NULL,
  end REAL NOT NULL,
  duration REAL NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sequence ON segments(sequence);
CREATE INDEX idx_start_time ON segments(start);
CREATE INDEX idx_filename ON segments(filename);
```

## Network Architecture

Docker Compose creates an internal network `audio-sync-network`:

```
audio-sync-network (bridge)
├── audio-sync-ffmpeg      (no external ports)
├── audio-sync-indexer     (no external ports)
├── audio-sync-backend     (0.0.0.0:4000 -> 4000)
└── audio-sync-frontend    (0.0.0.0:3030 -> 3000)
```

**Internal DNS**:
- Services communicate via service names
- Backend accesses storage via `/storage` mount
- Frontend connects to backend via `NEXT_PUBLIC_API_URL`

## Security Considerations

### Production Recommendations

1. **Change Default Ports**: Avoid well-known ports
2. **Add Authentication**: Implement JWT or session-based auth
3. **Enable HTTPS**: Use reverse proxy (nginx/traefik) with SSL
4. **Restrict CORS**: Set specific origins instead of `*`
5. **Network Isolation**: Use Docker networks to isolate services
6. **Resource Limits**: Add memory/CPU limits in docker-compose.yml
7. **Storage Cleanup**: Implement rotation for old segments
8. **Rate Limiting**: Add API rate limiting in backend

### Example Resource Limits
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Troubleshooting Setup

### Port Already in Use
```bash
# Check what's using port 3030
lsof -i :3030

# Change port in docker-compose.yml
# frontend:
#   ports:
#     - "3031:3000"
```

### Permission Denied on Storage
```bash
# Fix permissions
sudo chmod -R 777 storage/
# Or use your user
sudo chown -R $USER:$USER storage/
```

### Docker Daemon Not Running
```bash
# macOS
open -a Docker

# Linux
sudo systemctl start docker
```

### Out of Disk Space
```bash
# Clean up Docker
docker system prune -a --volumes

# Check disk usage
df -h
du -sh storage/
```

## Next Steps

After completing setup, proceed to [RUN.md](./RUN.md) for instructions on:
- Starting the services
- Accessing the player
- Testing with VLC
- Monitoring logs
- Troubleshooting runtime issues

## Support

For issues or questions:
1. Check [RUN.md](./RUN.md) troubleshooting section
2. Review Docker logs: `docker compose logs`
3. Verify all services are healthy: `docker compose ps`
