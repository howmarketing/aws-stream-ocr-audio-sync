# Audio Sync Platform - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Start the System
```bash
cd /Users/m4/Documents/Gabs/bd-tasks/envs/applications/aws-stream-ocr-audio-sync
docker compose up -d
```

### 2. Wait for Services (30 seconds)
```bash
docker compose ps
```

Look for **(healthy)** status on backend and ffmpeg services.

### 3. Open the App
```
http://localhost:3030
```

### 4. Test Audio Player
1. Click **"Open Player"**
2. Click **"Play"** button
3. Hear audio and see time updating

### 5. Test Sync with Scoreboard
1. Click **"Sync with Scoreboard"** button
2. Upload a scoreboard image (JPEG/PNG)
3. Wait 2-3 seconds for OCR processing
4. Review detected clock time and confidence
5. Click **"Sync Player"**
6. Audio jumps to detected time

---

## 📋 Quick Commands

```bash
# Start
docker compose up -d

# Stop
docker compose down

# Restart
docker compose restart

# View logs
docker compose logs -f

# Check health
curl http://localhost:4000/api/health

# Run tests
cd backend && npm test -- src/
```

---

## 🧪 Quick Test

```bash
# Test OCR API
curl -X POST http://localhost:4000/api/ocr/upload \
  -F "image=@/path/to/scoreboard.jpg" | jq .

# Test Sync API
curl -X POST http://localhost:4000/api/sync \
  -H "Content-Type: application/json" \
  -d '{"clock": "12:34", "confidence": 0.95}' | jq .
```

---

## 📚 Full Documentation

- **Manual Testing**: `MANUAL-TESTING-GUIDE.md`
- **Test Summary**: `TESTING-SUMMARY.md`
- **Performance**: `PERFORMANCE.md`
- **Deployment**: `DEPLOYMENT.md`
- **User Guide**: `USER-GUIDE.md`
- **API Docs**: `API.md`
- **Architecture**: `ARCHITECTURE.md`

---

## 🎯 Key Endpoints

- **Frontend**: http://localhost:3030
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/api/health
- **HLS Playlist**: http://localhost:4000/api/hls/playlist

---

## ✅ System Status

```
✅ Backend:  http://localhost:4000  (healthy)
✅ Frontend: http://localhost:3030  (running)
✅ FFmpeg:   (processing audio)     (healthy)
✅ Indexer:  (indexing segments)    (running)
✅ OCR:      (ready for uploads)    (running)
```

---

## 🆘 Need Help?

1. Check logs: `docker compose logs -f`
2. Restart: `docker compose restart`
3. See `MANUAL-TESTING-GUIDE.md` for detailed troubleshooting
4. See `SPRINT-COMPLETION-SUMMARY.md` for full status

---

**You're all set!** 🎉

The Audio Sync Platform is running and ready for testing.
