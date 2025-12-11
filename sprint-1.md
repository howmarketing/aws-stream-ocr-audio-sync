# 🚀 Sprint 1 — End-to-End Proof of Concept

**Duration:** 2 weeks
**Team Size:** 1-2 developers
**Sprint Goal:** Deliver a working audio streaming pipeline from external source → HLS → player

---

## 🎯 Sprint Objective

Build a **minimal viable streaming system** that demonstrates:
- External audio stream ingestion via FFmpeg
- HLS segment generation with low latency
- Basic segment indexing
- Simple backend API
- Functional web player

**Success Criteria:**
- ✅ Audio stream plays in browser with <10s latency
- ✅ Segments generate continuously for 10+ minutes
- ✅ Index database tracks segment timestamps
- ✅ Player can play/pause
- ✅ All components run via Docker Compose

---

## 📦 Sprint Deliverables

1. **Working streaming pipeline** (FFmpeg + HLS generation)
2. **Indexer worker** (basic SQLite tracking)
3. **NestJS API** (minimal endpoints)
4. **Next.js player** (basic playback only)
5. **Docker Compose** orchestration
6. **Documentation** (setup + run guide)

---

## 📋 Task Breakdown by Priority

### **🔴 CRITICAL PATH (Must Complete)**

#### **Part 1: Environment & Foundation** (1-2 days)
*Complete remaining Phase 0 tasks*

- [ ] **Task 9**: Install FFmpeg via Homebrew
  - `brew install ffmpeg`
  - Verify: `ffmpeg -version`

- [ ] **Task 15-20**: Create monorepo structure
  ```bash
  mkdir audio-sync-platform
  cd audio-sync-platform
  mkdir -p frontend backend streaming storage/{hls,index} docs
  git init
  ```

- [ ] **Task 16-17**: Initialize Git
  - Create `.gitignore` (Node, Python, Docker, FFmpeg artifacts)
  - Initial commit

- [ ] **Task 21-23**: Setup package management
  - Create root `package.json` with workspaces
  - Create `pnpm-workspace.yaml`
  - Create `tsconfig.base.json`

- [ ] **Task 37-40**: Setup storage structure
  ```bash
  mkdir -p storage/hls storage/index
  touch storage/hls/.gitkeep storage/index/.gitkeep
  ```

- [ ] **Task 41-44**: Initialize Docker Compose
  - Create `docker-compose.yml` skeleton
  - Define networks and volumes

**Estimated Time:** 4-6 hours

---

#### **Part 2: Streaming Pipeline (Core)** (3-4 days)
*Simplified Phase 1 — minimal working pipeline*

- [ ] **Task 45-56**: FFmpeg Worker Container
  - Create `streaming/ffmpeg-worker/Dockerfile`
  - Base image: `linuxserver/ffmpeg:latest` or `jrottenberg/ffmpeg:alpine`
  - Create `streaming/ffmpeg-worker/entrypoint.sh`
  - Configure FFmpeg command:
    ```bash
    ffmpeg -i "$STREAM_URL" \
      -c:a aac -b:a 128k -ar 48000 -ac 2 \
      -f hls \
      -hls_time 2 \
      -hls_list_size 10 \
      -hls_flags independent_segments+delete_segments+append_list \
      -hls_segment_filename "/storage/hls/segment%03d.ts" \
      "/storage/hls/index.m3u8"
    ```
  - Add to docker-compose.yml
  - Map volume: `/storage/hls`

- [ ] **Task 57-64**: Test HLS output
  - Use test stream URL (e.g., `http://stream.live.vc.bbcmedia.co.uk/bbc_world_service`)
  - Verify segments generate in `/storage/hls/`
  - Verify playlist updates every 2s
  - Test playback with VLC locally

- [ ] **Task 65-75**: Indexer Worker (Simplified)
  - Create `streaming/indexer/` folder
  - Choose: Node.js worker (simpler for this stack)
  - Create `streaming/indexer/package.json`
  - Create `streaming/indexer/src/index.ts`
  - Install: `chokidar`, `better-sqlite3`
  - Watch `/storage/hls` for new `.ts` files
  - Parse segment sequence from filename
  - Calculate timestamp: `sequence * segment_duration`
  - Insert into SQLite:
    ```sql
    CREATE TABLE segments (
      id INTEGER PRIMARY KEY,
      sequence INTEGER,
      filename TEXT,
      start REAL,
      end REAL,
      created_at TEXT
    );
    ```
  - Add Dockerfile for indexer
  - Add to docker-compose.yml

- [ ] **Task 81-88**: Integration Test
  - `docker compose up ffmpeg-worker indexer`
  - Verify continuous segment generation for 10 minutes
  - Verify index DB grows
  - Verify playlist is valid
  - Test playback in browser (via static file server)

**Estimated Time:** 12-16 hours

---

#### **Part 3: Backend API (Minimal)** (2-3 days)
*Simplified Phase 2 — essential endpoints only*

- [ ] **Task 93-99**: NestJS Scaffold
  ```bash
  cd backend
  pnpm create nest-app . --package-manager pnpm
  ```
  - Configure strict TypeScript
  - Add `.env` support
  - Create Dockerfile

- [ ] **Task 141-149**: HLS Module (Serve Playlist & Segments)
  - Create `src/domains/hls/hls.module.ts`
  - Create `src/domains/hls/hls.controller.ts`
  - Create `src/domains/hls/hls.service.ts`

  **Endpoints:**
  - `GET /api/hls/playlist` → serve `/storage/hls/index.m3u8`
  - `GET /api/hls/segments/:filename` → serve `.ts` files

  **Implementation:**
  ```typescript
  @Controller('hls')
  export class HlsController {
    @Get('playlist')
    getPlaylist(@Res() res: Response) {
      return res.sendFile('/storage/hls/index.m3u8');
    }

    @Get('segments/:filename')
    getSegment(@Param('filename') filename: string, @Res() res: Response) {
      return res.sendFile(`/storage/hls/${filename}`);
    }
  }
  ```
  - Add CORS configuration
  - Add cache headers (`Cache-Control: max-age=2`)

- [ ] **Task 132-140**: Index Module (Read-only for now)
  - Create `src/domains/index/index.module.ts`
  - Create repository to query SQLite
  - Add endpoint: `GET /api/index/segments?limit=10`
  - Return recent segments for debugging

- [ ] **Task 158-162**: Backend Config
  - Add CORS for `http://localhost:3000` (frontend)
  - Add health check endpoint: `GET /api/health`
  - Configure port 4000
  - Add to docker-compose.yml

**Estimated Time:** 8-12 hours

---

#### **Part 4: Frontend Player (Minimal)** (2-3 days)
*Simplified Phase 3 — basic playback only*

- [ ] **Task 163-170**: Next.js Setup
  ```bash
  cd frontend
  pnpm create next-app@latest . --typescript --tailwind --app
  ```
  - Configure for Next.js 16
  - Setup TypeScript strict mode
  - Install dependencies:
    ```bash
    pnpm add hls.js
    pnpm add -D @types/hls.js
    ```

- [ ] **Task 171-188**: Audio Player Component
  - Create `app/player/page.tsx`
  - Create `app/player/components/AudioPlayer.tsx`
  - Create `app/player/hooks/useHls.ts`
  - Create `app/player/hooks/usePlayer.ts`

  **Basic Implementation:**
  ```typescript
  // useHls.ts
  import Hls from 'hls.js';
  import { useEffect, useRef } from 'react';

  export function useHls(audioRef: RefObject<HTMLAudioElement>) {
    const hlsRef = useRef<Hls | null>(null);

    useEffect(() => {
      if (!audioRef.current) return;

      const hls = new Hls({
        lowLatencyMode: true,
        backBufferLength: 10,
      });

      hls.loadSource('http://localhost:4000/api/hls/playlist');
      hls.attachMedia(audioRef.current);

      hlsRef.current = hls;

      return () => {
        hls.destroy();
      };
    }, []);

    return hlsRef;
  }

  // AudioPlayer.tsx
  export function AudioPlayer() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const hlsRef = useHls(audioRef);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    };

    return (
      <div>
        <audio ref={audioRef} />
        <button onClick={togglePlay}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    );
  }
  ```

- [ ] **Task 218-221**: Build & Deploy Config
  - Add build script
  - Configure `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:4000`
  - Add to docker-compose.yml (optional for Sprint 1)

**Estimated Time:** 8-12 hours

---

#### **Part 5: Integration & Testing** (1-2 days)

- [ ] **End-to-End Test**
  - Start all services: `docker compose up`
  - Verify FFmpeg ingests stream
  - Verify segments appear in `/storage/hls/`
  - Verify indexer tracks segments
  - Verify backend API serves playlist
  - Verify frontend player loads and plays audio
  - Test for 30 minutes of continuous playback

- [ ] **Documentation**
  - Create `SETUP.md` with installation steps
  - Create `RUN.md` with how to start the system
  - Document known issues
  - Add troubleshooting section

**Estimated Time:** 4-6 hours

---

### **🟡 NICE-TO-HAVE (If Time Permits)**

- [ ] Add basic error handling in player
- [ ] Add loading states in UI
- [ ] Add latency indicator (calculate live edge vs current position)
- [ ] Add basic seeking (±10s buttons)
- [ ] Add retry logic for FFmpeg worker
- [ ] Add basic logging across services

**Estimated Time:** 4-8 hours

---

### **🟢 DEFERRED (Sprint 2+)**

- OCR functionality
- Sync engine
- Advanced player controls (±1.5s)
- Comprehensive testing
- CI/CD pipeline
- Advanced error recovery
- UI/UX polish

---

## 🗓️ Sprint Timeline

### **Week 1**
- **Day 1-2:** Complete environment setup + monorepo structure
- **Day 3-5:** Implement streaming pipeline (FFmpeg + Indexer)

### **Week 2**
- **Day 6-7:** Implement backend API
- **Day 8-9:** Implement frontend player
- **Day 10:** Integration testing + documentation

---

## 🎬 Docker Compose Structure (Sprint 1)

```yaml
version: '3.9'

services:
  ffmpeg-worker:
    build: ./streaming/ffmpeg-worker
    environment:
      - STREAM_URL=http://stream.live.vc.bbcmedia.co.uk/bbc_world_service
    volumes:
      - ./storage/hls:/storage/hls
    restart: unless-stopped

  indexer:
    build: ./streaming/indexer
    volumes:
      - ./storage/hls:/storage/hls
      - ./storage/index:/storage/index
    depends_on:
      - ffmpeg-worker
    restart: unless-stopped

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    volumes:
      - ./storage:/storage
    environment:
      - PORT=4000
      - STORAGE_PATH=/storage
    depends_on:
      - indexer
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:4000
    depends_on:
      - backend

volumes:
  hls-storage:
  index-storage:

networks:
  default:
    name: audio-sync-network
```

---

## ✅ Definition of Done

Sprint 1 is complete when:

1. ✅ All services start via `docker compose up`
2. ✅ Audio stream plays continuously for 30+ minutes
3. ✅ Player controls work (play/pause)
4. ✅ Segments are indexed in SQLite
5. ✅ No crashes or fatal errors for 1 hour
6. ✅ Setup documentation exists
7. ✅ Code is committed to Git
8. ✅ Demo video recorded (optional)

---

## 🚨 Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| FFmpeg crashes on stream disconnect | High | Add restart policy + health checks |
| CORS issues between frontend/backend | Medium | Configure CORS early |
| HLS not playing in browser | High | Test with VLC first, validate m3u8 format |
| Docker volume permissions | Medium | Use proper user mappings in Dockerfile |
| Index DB file locks | Low | Use SQLite WAL mode |

---

## 🎓 Learning Goals

- Understand HLS streaming fundamentals
- Master Docker multi-service orchestration
- Practice NestJS modular architecture
- Learn hls.js integration in React
- Gain experience with FFmpeg

---

## 📊 Sprint Metrics

- **Estimated Total Hours:** 40-50 hours
- **Critical Path Hours:** 36-46 hours
- **Buffer for Issues:** 20%
- **Target Completion:** 80% of tasks

---

## 🔄 Next Sprint Preview (Sprint 2)

After Sprint 1 completion:
- Add OCR service
- Implement sync engine
- Add ±1.5s / ±10s seeking
- Improve error handling
- Add comprehensive testing
- Polish UI/UX

---

## 📝 Notes

- Focus on **working end-to-end** over perfection
- Use test audio stream (BBC World Service or similar)
- Keep components simple and modular
- Document as you go
- Commit frequently

---

**Created:** 2025-12-11
**Sprint Start:** TBD
**Sprint End:** TBD
**Status:** 🔵 Not Started

---

## 🎯 Success Mantra

> "Ship a working proof of concept. Iterate from there."

The goal is not perfection — it's **proving the architecture works end-to-end**.

Good luck! 🚀
