# 🎧 Audio Sync Platform

**Low-Latency Audio Streaming with Scoreboard Synchronization**

A local, cloud-free simulation of AWS MediaLive + MediaPackage for real-time audio streaming with OCR-based scoreboard synchronization.

---

## 🚀 Features

- ✅ **Low-latency HLS audio streaming** (<6 seconds with 2s segments)
- ✅ **FFmpeg-based ingestion** from any HTTP audio source
- ✅ **Automatic segment indexing** with SQLite
- ✅ **Next.js 16 + React 19 player** with hls.js
- ✅ **NestJS backend** with Domain-Driven Design
- ✅ **OCR-based scoreboard sync** (coming soon)
- ✅ **100% local, no cloud costs**

---

## 📦 Tech Stack

| Layer          | Technology                     |
|----------------|--------------------------------|
| Frontend       | Next.js 16, React 19.2, hls.js |
| Backend        | NestJS 11, TypeScript          |
| Streaming      | FFmpeg 8, HLS/LL-HLS           |
| OCR (planned)  | Tesseract, OpenCV              |
| Database       | SQLite                         |
| Infrastructure | Docker Compose                 |

---

## 🛠️ Prerequisites

- **Node.js** ≥ 20.0.0
- **pnpm** ≥ 8.0.0
- **Docker Desktop** (Apple Silicon or x86)
- **FFmpeg** ≥ 8.0.0 (installed via Homebrew)
- **macOS** (or Linux/Windows with WSL2)

---

## 📋 Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd audio-sync-platform
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env if needed
```

### 3. Start All Services

```bash
docker compose up -d
```

### 4. Verify Services

```bash
# Check all services are running
docker compose ps

# View logs
docker compose logs -f

# Test FFmpeg worker
ls -la storage/hls/
```

### 5. Access the Player

Open **http://localhost:3000** in your browser.

---

## 🗂️ Project Structure

```
audio-sync-platform/
├── frontend/           # Next.js 16 player
├── backend/            # NestJS API
├── streaming/
│   ├── ffmpeg-worker/  # FFmpeg HLS generator
│   └── indexer/        # Segment timestamp indexer
├── storage/
│   ├── hls/            # HLS segments + playlist
│   └── index/          # SQLite index database
├── docs/               # Documentation
├── docker-compose.yml
├── package.json
└── pnpm-workspace.yaml
```

---

## 📚 Documentation

- **[Sprint 1 Plan](./sprint-1.md)** - First deliverable roadmap
- **[TODO List](./TODO.md)** - Complete implementation tasks (392 tasks)
- **[Architecture](./project_docs/architecture.md)** - System architecture
- **[Backend](./project_docs/backend.md)** - NestJS documentation
- **[Frontend](./project_docs/frontend.md)** - Next.js player
- **[Streaming Pipeline](./project_docs/streaming_pipeline.md)** - FFmpeg + indexing
- **[OCR & Sync](./project_docs/ocr_sync.md)** - Synchronization engine

---

## 🎯 Current Status (Sprint 1)

**Phase 0: Environment Setup** ✅ Complete
- [x] FFmpeg installed
- [x] Monorepo structure created
- [x] Git initialized
- [x] Package management configured
- [x] Docker Compose ready

**Phase 1: Streaming Pipeline** 🔄 In Progress
- [ ] FFmpeg worker container
- [ ] Indexer worker
- [ ] Integration testing

**Phase 2-5:** Pending

---

## 🧪 Development Workflow

```bash
# Start all services
pnpm docker:up

# View logs
pnpm docker:logs

# Stop all services
pnpm docker:down

# Rebuild containers
pnpm docker:build

# Run tests (when implemented)
pnpm test

# Lint code
pnpm lint
```

---

## 🐛 Troubleshooting

### FFmpeg worker not generating segments
```bash
# Check FFmpeg logs
docker logs audio-sync-ffmpeg

# Verify stream URL is accessible
curl -I $STREAM_URL
```

### Backend can't read segments
```bash
# Check volume mounts
docker inspect audio-sync-backend

# Verify storage permissions
ls -la storage/hls/
```

### Frontend can't connect to backend
```bash
# Verify backend is running
curl http://localhost:4000/api/health

# Check CORS configuration
cat backend/src/main.ts
```

---

## 📄 License

MIT

---

## 👥 Contributing

This is a portfolio/learning project. Contributions welcome!

---

## 🙏 Acknowledgments

Inspired by AWS MediaLive, MediaPackage, and modern streaming architectures.

---

**Built with ❤️ by Gabriel Ariza**

---

## 🔗 Links

- [Full Documentation](./project_docs/)
- [Sprint Plan](./sprint-1.md)
- [Task List](./TODO.md)
