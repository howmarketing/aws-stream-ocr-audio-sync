# Audio Sync Platform - Runtime Guide

## Quick Start

### Start All Services
```bash
cd /path/to/project/applications
docker compose up -d
```

### Access the Application
- **Frontend Player**: http://localhost:3030
- **Player Page**: http://localhost:3030/player
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/api/health

### Stop All Services
```bash
docker compose down
```

## Service Management

### Start Specific Services
```bash
# Start only backend and its dependencies
docker compose up -d backend

# Start frontend without health check dependencies
docker compose up -d --no-deps frontend

# Start all services
docker compose up -d ffmpeg-worker indexer backend frontend
```

### Restart Services
```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart frontend

# Rebuild and restart (after code changes)
docker compose up -d --build frontend
```

### Stop Services
```bash
# Stop all services (keep containers)
docker compose stop

# Stop and remove containers
docker compose down

# Stop and remove containers + volumes (DELETES DATA)
docker compose down -v
```

### View Service Status
```bash
# Check all services
docker compose ps

# Detailed status with formatting
docker compose ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}"
```

Expected healthy output:
```
SERVICE         STATUS                  PORTS
ffmpeg-worker   Up X minutes (healthy)
indexer         Up X minutes
backend         Up X minutes            0.0.0.0:4000->4000/tcp
frontend        Up X minutes            0.0.0.0:3030->3000/tcp
```

## Monitoring

### View Logs

**All Services**:
```bash
# Follow all logs
docker compose logs -f

# Last 100 lines from all services
docker compose logs --tail=100

# Logs since 10 minutes ago
docker compose logs --since 10m
```

**Specific Service**:
```bash
# FFmpeg worker (streaming output)
docker compose logs -f ffmpeg-worker

# Indexer (segment tracking)
docker compose logs -f indexer

# Backend (API requests)
docker compose logs -f backend

# Frontend (Next.js)
docker compose logs -f frontend
```

### Check Resource Usage
```bash
# Real-time stats for all containers
docker stats

# Specific container
docker stats audio-sync-backend

# One-time snapshot
docker stats --no-stream
```

### Inspect Services
```bash
# View container details
docker inspect audio-sync-backend

# View network details
docker network inspect audio-sync-network

# View volume details
docker volume ls
```

## Testing the System

### 1. Verify Services Are Running
```bash
# Check all containers
docker compose ps

# Verify health endpoints
curl http://localhost:4000/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-12-11T05:00:00.000Z","service":"audio-sync-backend","version":"1.0.0"}
```

### 2. Test HLS Playlist
```bash
# Get current playlist
curl http://localhost:4000/api/hls/playlist

# Get stream info
curl http://localhost:4000/api/hls/info
```

Expected playlist:
```m3u8
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-TARGETDURATION:2
#EXT-X-MEDIA-SEQUENCE:X
#EXTINF:2.005333,
segmentX.ts
#EXTINF:2.005333,
segmentY.ts
...
```

### 3. Test Index API
```bash
# Get all indexed segments
curl http://localhost:4000/api/index/segments

# Query segment by sequence number
curl http://localhost:4000/api/index/segments/100

# Search segments by time range
curl "http://localhost:4000/api/index/segments/search?start=0&end=60"
```

### 4. Verify Segments Are Generating
```bash
# Check HLS directory
docker exec audio-sync-ffmpeg ls -lh /storage/hls/

# Watch segments being created
docker exec audio-sync-ffmpeg sh -c 'watch -n 2 "ls -lh /storage/hls/*.ts | tail -15"'
```

### 5. Check Indexer Database
```bash
# Enter indexer container
docker exec -it audio-sync-indexer sh

# Query database
sqlite3 /storage/index/segments.db "SELECT COUNT(*), MIN(sequence), MAX(sequence) FROM segments;"

# Exit container
exit
```

### 6. Test with VLC Player

**Method 1: Direct HLS URL**
1. Open VLC Media Player
2. File → Open Network Stream (Cmd+N / Ctrl+N)
3. Enter URL: `http://localhost:4000/api/hls/playlist`
4. Click Play

**Method 2: Save Playlist File**
```bash
# Download playlist
curl http://localhost:4000/api/hls/playlist > stream.m3u8

# Open in VLC
vlc stream.m3u8
```

**Expected Result**:
- Audio should start playing within 2-6 seconds
- Stream should be continuous without buffering
- Latency should be <6 seconds from live

**VLC Debugging**:
- Tools → Media Information (Cmd+I / Ctrl+I)
- Tools → Messages (verbosity level 2)
- Check for HTTP errors or segment loading issues

### 7. Test Web Player
1. Open browser: http://localhost:3030
2. Click "Open Player"
3. Click Play button
4. Verify audio plays smoothly
5. Test seek/scrubbing functionality

**Browser Console Testing**:
```javascript
// Open browser DevTools (F12)
// Check for HLS errors
console.log('HLS.js loaded:', typeof Hls !== 'undefined');

// Monitor network requests
// Network tab → Filter by ".ts" to see segment requests
```

### 8. Long-Running Stability Test

**30-Minute Playback Test**:
```bash
# Start services
docker compose up -d

# Monitor in separate terminals
# Terminal 1: Watch FFmpeg
docker logs -f audio-sync-ffmpeg

# Terminal 2: Watch Indexer
docker logs -f audio-sync-indexer

# Terminal 3: Monitor segments
watch -n 5 "curl -s http://localhost:4000/api/hls/info"

# Open player in browser and let it run for 30+ minutes
# Monitor for:
# - Audio continuity
# - Segment 404 errors
# - Memory leaks
# - CPU usage spikes
```

**Check After 30 Minutes**:
```bash
# Verify segment count
curl http://localhost:4000/api/hls/info

# Check database
docker exec audio-sync-indexer sqlite3 /storage/index/segments.db \
  "SELECT COUNT(*), MAX(sequence) FROM segments;"

# Check resource usage
docker stats --no-stream
```

## API Reference

### Health Endpoints

**GET /api/health**
```bash
curl http://localhost:4000/api/health
```
Response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-11T05:00:00.000Z",
  "service": "audio-sync-backend",
  "version": "1.0.0"
}
```

### HLS Endpoints

**GET /api/hls/playlist**
```bash
curl http://localhost:4000/api/hls/playlist
```
Returns: HLS m3u8 playlist

**GET /api/hls/segments/:filename**
```bash
curl http://localhost:4000/api/hls/segments/segment001.ts -o segment.ts
```
Returns: MPEG-TS segment file

**GET /api/hls/info**
```bash
curl http://localhost:4000/api/hls/info
```
Response:
```json
{
  "status": "online",
  "segments": 10,
  "targetDuration": 2,
  "mediaSequence": 150,
  "playlistPath": "/api/hls/playlist"
}
```

### Index Endpoints

**GET /api/index/segments**
```bash
curl http://localhost:4000/api/index/segments
```
Returns: Array of all indexed segments

**GET /api/index/segments/:sequence**
```bash
curl http://localhost:4000/api/index/segments/100
```
Returns: Specific segment by sequence number

**GET /api/index/segments/search?start=X&end=Y**
```bash
curl "http://localhost:4000/api/index/segments/search?start=10&end=30"
```
Returns: Segments within time range (in seconds)

## Troubleshooting

### Services Won't Start

**Error: Port already in use**
```bash
# Find process using port
lsof -i :3030
lsof -i :4000

# Kill process or change port in docker-compose.yml
```

**Error: Backend unhealthy**
```bash
# Check if backend is actually responding
curl http://localhost:4000/api/health

# If responding, start frontend without health check
docker compose up -d --no-deps frontend

# Check backend logs
docker logs audio-sync-backend
```

**Error: Cannot connect to Docker daemon**
```bash
# macOS: Start Docker Desktop
open -a Docker

# Linux: Start Docker service
sudo systemctl start docker
```

### Streaming Issues

**No audio in player**
```bash
# 1. Check FFmpeg is streaming
docker logs audio-sync-ffmpeg | tail -20

# 2. Verify playlist exists
curl http://localhost:4000/api/hls/playlist

# 3. Check for segment files
docker exec audio-sync-ffmpeg ls -lh /storage/hls/

# 4. Test with VLC to isolate browser issues
vlc http://localhost:4000/api/hls/playlist
```

**Segments return 404**
```bash
# Check current media sequence
curl http://localhost:4000/api/hls/info

# Verify segments exist
docker exec audio-sync-ffmpeg ls /storage/hls/*.ts

# Check HLS.js configuration in browser console
# Should start from live edge, not old segments
```

**Audio stuttering/buffering**
```bash
# Check CPU usage
docker stats

# Verify network connectivity
ping -c 5 stream.live.vc.bbcmedia.co.uk

# Check FFmpeg encoding speed (should be ~1.0x)
docker logs audio-sync-ffmpeg | grep speed

# Increase buffer in HLS.js configuration
# Edit frontend/app/player/hooks/useHls.ts
```

### Database Issues

**Indexer not tracking segments**
```bash
# Check indexer logs
docker logs indexer

# Verify indexer can see HLS directory
docker exec audio-sync-indexer ls /storage/hls/

# Check database file exists
docker exec audio-sync-indexer ls -lh /storage/index/

# Manual database check
docker exec -it audio-sync-indexer sqlite3 /storage/index/segments.db
> SELECT COUNT(*) FROM segments;
> .quit
```

**Database locked error**
```bash
# Stop services
docker compose down

# Remove database (will be recreated)
rm storage/index/segments.db

# Restart services
docker compose up -d
```

### Performance Issues

**High CPU usage**
```bash
# Check which container is using CPU
docker stats

# If FFmpeg: Lower encoding quality
# Edit docker-compose.yml or entrypoint.sh

# If backend: Check for infinite loops in logs
docker logs audio-sync-backend

# If frontend: Rebuild production build
docker compose up -d --build frontend
```

**High memory usage**
```bash
# Check memory per container
docker stats --no-stream

# Add memory limits to docker-compose.yml
# See SETUP.md for resource limit examples

# Clear old segments
docker exec audio-sync-ffmpeg rm -f /storage/hls/segment*.ts
# (They will regenerate)
```

**Disk space issues**
```bash
# Check disk usage
du -sh storage/

# Remove old Docker images
docker system prune -a

# Monitor segment cleanup
# FFmpeg should auto-delete old segments (HLS_LIST_SIZE=10)
```

### Frontend Issues

**Page won't load**
```bash
# Check frontend logs
docker logs audio-sync-frontend

# Verify frontend container is running
docker ps | grep frontend

# Check CORS settings
curl -I http://localhost:4000/api/health

# Rebuild frontend
docker compose up -d --build frontend
```

**HLS.js errors in console**
```bash
# Common errors and fixes:

# 1. "fragLoadError" → Segment 404
#    Solution: Refresh page to start from live edge

# 2. "manifestLoadError" → Playlist 404
#    Solution: Verify FFmpeg is running

# 3. "MEDIA_ERROR" → Corrupt segment
#    Solution: Wait for next segment or refresh

# 4. "NETWORK_ERROR" → Backend unreachable
#    Solution: Check backend is running and CORS
```

### Network Issues

**Cannot access from other devices**
```bash
# 1. Check firewall rules
sudo ufw status  # Linux
# Or macOS System Preferences → Security

# 2. Bind to 0.0.0.0 (already configured)
# Services are accessible from network

# 3. Find your IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# 4. Access from other device
# http://YOUR_IP:3030
```

**CORS errors**
```bash
# Update CORS_ORIGIN in docker-compose.yml
# backend:
#   environment:
#     - CORS_ORIGIN=http://your-domain.com

# Restart backend
docker compose restart backend
```

## Maintenance

### View Storage Usage
```bash
# Check total storage
du -sh storage/

# Check HLS segments
du -sh storage/hls/

# Check database size
du -sh storage/index/
```

### Clear Old Data
```bash
# Stop services
docker compose down

# Remove all segments and database (will regenerate)
rm -rf storage/hls/* storage/index/*

# Restart services
docker compose up -d
```

### Backup Database
```bash
# Backup segments database
docker exec audio-sync-indexer sqlite3 /storage/index/segments.db ".backup /storage/index/segments.backup.db"

# Copy to host
docker cp audio-sync-indexer:/storage/index/segments.backup.db ./segments-backup-$(date +%Y%m%d).db
```

### Update Services
```bash
# Pull latest changes
git pull

# Rebuild all services
docker compose build

# Restart with new builds
docker compose up -d

# Or rebuild and restart in one command
docker compose up -d --build
```

## Development Workflow

### Watch Logs During Development
```bash
# Terminal 1: FFmpeg logs
docker logs -f audio-sync-ffmpeg

# Terminal 2: Backend logs
docker logs -f audio-sync-backend

# Terminal 3: Frontend logs
docker logs -f audio-sync-frontend

# Terminal 4: Indexer logs
docker logs -f audio-sync-indexer
```

### Hot Reload Frontend (Development)
```bash
# For development, mount source code:
# (Add to docker-compose.yml)
# frontend:
#   volumes:
#     - ./frontend:/app
#     - /app/node_modules

# Restart frontend
docker compose restart frontend
```

### Debug Backend
```bash
# Enter backend container
docker exec -it audio-sync-backend sh

# Check environment
env | grep NODE

# Test endpoints internally
wget -O- http://localhost:4000/api/health

# Exit container
exit
```

### Test API Changes
```bash
# Rebuild backend only
docker compose up -d --build backend

# Test endpoints
curl http://localhost:4000/api/hls/info
```

## Production Deployment

### Pre-Deployment Checklist
- [ ] Change default ports
- [ ] Enable HTTPS (use reverse proxy)
- [ ] Set strong CORS restrictions
- [ ] Add authentication
- [ ] Configure resource limits
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure log rotation
- [ ] Set up backups for database
- [ ] Test failover scenarios
- [ ] Load test with expected traffic

### Recommended Production Setup
```bash
# Use production environment
export NODE_ENV=production

# Add resource limits (see SETUP.md)
# Add restart policies (already configured)
# Use reverse proxy (nginx/traefik) for SSL
# Set up log aggregation
# Configure health checks and alerting
```

## Next Steps

After verifying the system works:
1. Review [SETUP.md](./SETUP.md) for configuration options
2. Implement Sprint 2 features (OCR, sync engine)
3. Add monitoring and observability
4. Implement authentication
5. Set up CI/CD pipeline

## Support

For issues:
1. Check this troubleshooting section
2. Review logs: `docker compose logs`
3. Check service status: `docker compose ps`
4. Verify configuration in `docker-compose.yml`
5. Review environment variables
