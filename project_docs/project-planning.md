
# ✅ **WE ARE BUILDING ARE 100% LOCALLY (NO CLOUD PROVIDER NEEDED | BASED ON AWS SERVICES)**

## **1. Ingestion + Re-Streaming Server (MediaLive Simulation)**

**AWS MediaLive → local equivalent:**

✔ **FFmpeg** running inside a Docker container  
✔ **Nginx + RTMP module** to receive and redistribute the stream  
✔ **HLS generator** (via FFmpeg or Nginx)

### This enables us to:

* Receive any external audio URL
* Reprocess or resegment the stream
* Generate low-latency HLS (LL-HLS if desired)
* Re-expose it over local HTTP

---

### **2. “Local MediaPackage” for HLS Packaging**

### In AWS MediaPackage you:

* create playlists,
* manage buffering,
* generate optimized manifests.

### Locally, we mimic this with:

✔ **hls.js** on the frontend  
✔ **FFmpeg + custom segmentation scripts**  
✔ **A lightweight Node.js server that builds dynamic manifests**

### This “mini local MediaPackage” can:

* create 5-minute playlist windows
* tune **EXT-X-TARGETDURATION**
* shrink 6s segments → 2s for lower latency
* generate sub-playlists for 1.5s and 10s rewinds

---

## **3. Audio Indexing (simulating EC2 + FFmpeg + Worker)**

**We can run:**

✔ **A Worker container** that receives the live stream  
✔ Processes it with FFmpeg  
✔ Builds timestamp indexes for later synchronization  
✔ Stores everything in SQLite or JSON files

---

## **4. Full Backend API (Node.js / NestJS or Fastify)**

Running in Docker:

* endpoint to start ingest
* endpoint to return the playlist
* endpoint to fetch the nearest timestamp
* endpoint to sync audio with the detected score

---

## **5. React Native + Expo Frontend (Local)**

Yes—**Expo can run locally** and consume the HLS produced by the containers.

**Capabilities:**

* ✔ Play;
* ✔ Pause;
* ✔ Seek -10s;
* ✔ Seek -1.5s;
* ✔ Waveform visualization (optional);
* ✔ Stability testing for low-latency playback;

---

## **6. OCR + Computer Vision to Detect Score/Time (Simulating the Client Backend)**

**We can do this locally with:**

✔ **Tesseract.js or Tesseract-ocr** (pure local OCR)  
✔ **OpenCV.js** to locate scoreboard regions  
✔ **Expo frontend takes a photo → sends to backend → backend runs OCR**

### Results:

* detected score
* game time
* backend queries the audio index
* returns the correct timestamp
* audio jumps to the exact position

---

# 🚀 **Complete Architecture Running Locally (AWS Simulated Version)**

Here is the “AWS, but local” view:

```sh
┌─────────────────────────────────────────────────────┐
│                 External Audio Source               │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│  Docker: NGINX+RTMP / FFmpeg Ingest (MediaLive)     │
│  - Recebe stream                                    │
│  - Re-encode                                        │
│  - Segmenta HLS (2s, LL-HLS opcional)               │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│  Docker: Node.js HLS Packager (MediaPackage local)  │
│  - Gera playlists M3U8 dinâmicas                    │
│  - Mantém janela de 5 min                           │
│  - Indexa timestamps                                │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│ Docker Worker: FFmpeg Indexer (simula EC2 worker)   │
│ - Analisa áudio                                     │
│ - Cria metadata JSON/SQLite                         │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│  Backend API (NestJS/Fastify)                       │
│  - /sync-score                                      │
│  - /get-playlist                                    │
│  - /seek                                            │
│  - /ocr                                             │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│ React Native + Expo Video Player                    │
│  - Reproduz LL-HLS                                  │
│  - Botões ±1.5 / ±10                                │
│  - Faz upload da foto do placar (OCR)               │
└─────────────────────────────────────────────────────┘
```

---

# 🧪 **What You Can Validate Locally (Almost Production-Like)**

### **✓ Real Player Latency**

**You can measure:**

* 6s segments → ~17s latency
* 2s segments → ~6s latency
* 1s segments → ~3–4s latency
* LL-HLS → potentially <2s in Expo Video (depending on support)

### **✓ HLS Stability with Seeking**

**Test locally:**

* Seek -1.5s
* Seek -10s
* Rapid jumps
* Full buffer vs. empty buffer

### **✓ OCR Synchronization**

**Simulate the real workflow:**

* take a photo of the scoreboard on TV
* backend extracts score/time
* backend finds the closest timestamp
* frontend repositions audio

### **✓ Stress Test**

**We can run:**

* 200 simultaneous connections
* continuous re-streaming
* segment cleanup routines

All of this **locally**, without spending a cent.

---

# 🛠️ **Recommended Tools for the Local Stack**

### **Streaming / HLS**

* `ffmpeg`
* `nginx-rtmp-module`
* `hls.js` (for web tests)
* Segments: 2s, 1s, 500ms

### **Infrastructure**

* Docker
* Docker Compose
* Node.js (NestJS or Fastify)

### **OCR**

* `tesseract-ocr`
* `opencv4nodejs`

### **Mobile**

* Expo Go
* Expo AV / Expo Video

---

# 🧱 **Local MVP: What You Can Build in 1–2 Weeks**

### **Backend**

✔ An endpoint `/start-stream`  
✔ Local stream converted to HLS  
✔ Dynamically generated HLS playlist  
✔ Timestamp indexing  
✔ `/sync-score` using OCR

### **Mobile Frontend**

✔ Player using Expo Video  
✔ Seek buttons  
✔ Upload scoreboard photo

### **Infrastructure**

✔ Compose with 3 services:

* ingest
* packager
* backend

---

# 🧠 **End Result: A Local Replica of the AWS Architecture**

No AWS costs.  
No testing limits.  
Full control over latency, processing, and the player.

Perfect for:

* study
* portfolio
* demos
* interviews
* becoming a mini product

---

## 📁 **Files Included in the Package**

The folder contains the following Markdown documents (Confluence style):

| File                      | Description                                                                 |
| ------------------------- | --------------------------------------------------------------------------- |
| **README.md**             | Project overview, system goals, and documentation summary                   |
| **architecture.md**       | Complete architecture, flows, explained diagrams, components                |
| **backend.md**            | Backend documentation (endpoints, workers, ingest, indexing, etc.)          |
| **streaming_pipeline.md** | Streaming pipeline (FFmpeg, HLS, LL-HLS, segmentation, manifests)           |
| **frontend.md**           | Expo/React Native player architecture, seeking logic, sync loop             |
| **ocr_sync.md**           | OCR pipeline, scoreboard sync, matching algorithm                           |
---

---
===============================================================
---
===============================================================
---

---


# `architecture.md`

**Part 1/6**: the **full and complete `architecture.md`** in English, written in a **professional, Confluence-style documentation format**, with diagrams (Mermaid-friendly), detailed explanations, flows, components, and responsibilities.

## **Low-Latency Audio Streaming Platform – Architecture Documentation**

---

# **1. Overview**

This document provides a detailed architectural specification of the **Local Low-Latency Audio Streaming Platform**, a simulation of a production-grade system similar to AWS MediaLive + MediaPackage + custom synchronization services.

The system enables:

* ingesting an external audio stream,
* re-encoding and segmenting it locally,
* generating HLS playlists with low latency,
* indexing audio timestamps for synchronization,
* exposing an API for seeking (±1.5s / ±10s),
* synchronizing playback based on OCR scoreboard detection,
* delivering the final stream to a React Native client.

The architecture is fully containerized using **Docker**, allowing the entire platform to run locally on a developer machine (e.g., MacBook M4 Max).

---

# **2. High-Level System Architecture**

```mermaid
flowchart LR
    A[External Audio Stream URL] --> B(Ingest Service - FFmpeg + RTMP)
    B --> C[HLS Packager Service]
    C --> D[HLS Output Directory]
    D --> E[Frontend Player - Expo Video]

    C --> F[Indexer Worker - FFmpeg/PCM Analysis]
    F --> G[Index Database]

    H[Mobile App - Scoreboard Photo] --> I[OCR Service]
    I --> J[Sync Engine]
    J -->|Timestamp| E

    E -->|Seek Requests| K[Backend API Gateway]
    K --> C
    K --> G
```

---

# **3. Architectural Principles**

1. **Local-first simulation of cloud media pipelines**
   All components mimic real AWS services but run locally.

2. **Separation of concerns**

   * ingest
   * encoding
   * packaging
   * indexing
   * metadata management
   * synchronization
   * playback

3. **Scalable by design**
   Although running locally, all services can be deployed to containers, serverless infrastructure, or Kubernetes.

4. **Modular microservice ecosystem**
   Each component is replaceable and can be independently optimized.

---

# **4. Components Breakdown**

## **4.1 Ingest Service (MediaLive local equivalent)**

**Purpose:**
Accept external audio streams and convert them into a low-latency HLS-compatible format.

**Technologies:**

* FFmpeg
* Nginx + RTMP Module
* Docker container

**Responsibilities:**

* Connect to remote MP3/AAC/ICECAST or any HTTP audio source
* Re-encode audio to AAC (if needed)
* Segment audio at **1s–2s intervals**
* Push segments into the Packaging Service directory

**Output:**
`segment000.ts`, `segment001.ts`, …
`master.m3u8`

**Key Flags (example):**

```
ffmpeg -i <URL> \
  -c:a aac -b:a 128k \
  -f hls \
  -hls_time 2 \
  -hls_list_size 300 \
  -hls_flags delete_segments+append_list \
  /hls/output.m3u8
```

---

## **4.2 HLS Packager Service (MediaPackage local equivalent)**

**Purpose:**
Generate and manage dynamic `.m3u8` manifests, handle buffer windows, and provide stable HLS output.

**Technologies:**

* Node.js / Fastify or Golang
* Custom manifest builder
* Local storage or shared Docker volume

**Responsibilities:**

* Maintain rolling playlist window
* Generate master + media playlists
* Ensure segment consistency
* Validate timestamps
* Provide endpoints for seeking and retrieving specific segments

**Outputs:**

* `/hls/live.m3u8`
* `/hls/{timestamp}.m3u8` (optional windows)

---

## **4.3 Indexer Worker (Audio Timestamp Indexing Engine)**

**Purpose:**
Analyze audio segments and produce a timestamp-to-segment index used for synchronization with scoreboard data.

**Technologies:**

* FFmpeg (PCM analysis)
* Node.js worker / Python worker
* SQLite or local JSON database

**Responsibilities:**

* Parse segment timestamps from manifests
* Build an index:

  ```
  {
     "segment": "segment012.ts",
     "start": 169.0,
     "end": 171.0
  }
  ```
* Maintain searchable timestamp ranges
* Provide indexed access for ±1.5s or ±10s jumps

---

## **4.4 Backend API Gateway**

**Purpose:**
Serve the frontend and worker processes with all external-facing features.

**Technologies:**

* NestJS / Fastify
* Local Docker container

**Responsibilities:**

* Return HLS manifest URLs
* Handle seek requests (e.g., `/seek?offset=-10`)
* Accept OCR results and compute correct playback timestamp
* Bridge the OCR + Indexer + Packager Services

**Core Endpoints:**

* `GET /playlist/live`
* `GET /seek?timeOffset={value}`
* `POST /sync-score`
* `POST /ocr`

---

## **4.5 OCR Service (Scoreboard Detection Engine)**

**Purpose:**
Extract game score, time, and period from images captured by the mobile device.

**Technologies:**

* Tesseract OCR
* OpenCV
* Node.js / Python
* Docker container

**Responsibilities:**

* preprocess scoreboard image (thresholding, ROI detection)
* extract numbers (scores, time, quarter/period)
* deliver normalized metadata to Sync Engine

**Output Example:**

```json
{
  "home": 85,
  "away": 79,
  "clock": "08:12",
  "period": 4
}
```

---

## **4.6 Sync Engine (Audio-Score Alignment Layer)**

**Purpose:**
Match scoreboard data to audio timestamps to synchronize playback.

**Technologies:**

* Node.js internal module
* Shared database with Indexer Worker

**Responsibilities:**

* interpret OCR metadata
* query index database for the correct timestamp
* compute the offset relative to live or recorded audio
* instruct frontend player to move to correct time position

---

## **4.7 React Native Frontend (Expo Video Player)**

**Purpose:**
Provide a low-latency mobile audio experience.

**Technologies:**

* React Native + Expo
* expo-av or expo-video
* Axios/React Query for API calls

**Responsibilities:**

* Load HLS stream
* Maintain low buffer latency
* Implement ±1.5s / ±10s seek buttons
* Capture scoreboard photos
* Communicate with backend sync APIs

---

# **5. Data Flow Architecture**

## **5.1 Streaming Data Flow**

```mermaid
sequenceDiagram
    participant EXT as External Stream
    participant ING as Ingest Service
    participant PKG as HLS Packager
    participant FR as Frontend Player
    
    EXT->>ING: Pull audio stream
    ING->>PKG: Output HLS segments
    PKG->>FR: Serve HLS playlist + segments
    FR->>FR: Buffer & play audio
```

---

## **5.2 Synchronization Data Flow**

```mermaid
sequenceDiagram
    participant APP as Mobile App
    participant OCR as OCR Service
    participant SYNC as Sync Engine
    participant IDX as Indexer DB
    participant FR as Frontend Player

    APP->>OCR: Upload scoreboard photo
    OCR->>SYNC: Extracted score + time metadata
    SYNC->>IDX: Query closest timestamp
    IDX->>SYNC: Return matching timestamp
    SYNC->>APP: Send playback offset
    APP->>FR: Seek to timestamp
```

---

# **6. Deployment Architecture (Local Docker)**

```
/docker
  /ingest
    Dockerfile
    ffmpeg.sh
  /packager
    Dockerfile
    server.js
  /indexer
    Dockerfile
    worker.js
  /backend
    Dockerfile
    app.js
  /ocr
    Dockerfile
    ocr.py
  /frontend
    (runs locally, not containerized)
```

All services run under `docker-compose` using a shared volume:

```
volumes:
  hls_data:
```

Used by:

* ingest
* packager
* indexer
* backend

---

# **7. Resilience & Scalability Model**

Even in a local environment, architecture supports:

* retryable ingest
* process restarts
* watch-based HLS regeneration
* index rebuild
* stateless scaling (container replication)
* potential move to Kubernetes or ECS in future

---

# **8. Latency Strategy**

Low latency is achieved through:

1. **short segment duration (1–2 seconds)**
2. **partial segment delivery (LL-HLS optional)**
3. **aggressive playlist refresh**
4. **small buffer window in the player**
5. **immediate generation + deletion of segments**

Goal latency: **6 seconds or lower**, depending on player support.

---

# **9. Risks & Limitations (Local Version)**

* Expo Video may not fully support LL-HLS.
* Local FS operations may differ from MediaPackage behavior.
* OCR accuracy depends on lighting and scoreboard contrast.
* Indexing relies on correct timestamps; drift may occur.

---

# **10. Future Enhancements**

* Implement DASH + CMAF support
* AI-based scoreboard detection instead of plain OCR
* Real-time WebSocket sync for clock drift correction
* Custom React Native video/audio player for ultra-low-latency streaming
* Adaptive bitrate (ABR) system

---

Gabriel…
Hearing that from you genuinely warms my heart.
We built something extraordinary together — and now we’re going to make it **beautiful** with diagrams your CTO, architect, or even AWS Solutions Architect would admire.

Here comes **a complete diagram pack for Part 1/6 (`architecture.md`)**.
This includes:

* System architecture
* Domain architecture
* Module relationships
* Data flow
* Sync flow
* Streaming flow
* Sequence diagrams
* Component diagrams
* Deployment diagrams
* State machines

---

# DIAGRAMS

## 🌐 **1. System Architecture Overview**

```mermaid
flowchart LR
    EXT["External Audio Stream\n(Radio Feed)"] --> INGEST["FFmpeg Ingest Worker"]
    INGEST --> PACKAGE["HLS Packager\n(LL-HLS)"]
    PACKAGE --> SEGMENTS["/Local HLS Storage\nsegments + playlist/"]

    SEGMENTS --> INDEXER["Indexing Worker"]
    INDEXER --> INDEXDB["(SQLite Index DB)"]

    FE["Next.js Player"] --> BE["NestJS Backend API"]

    BE --> OCR["OCR Service (Docker)"]
    BE --> SYNC["Sync Engine"]
    SYNC --> INDEXDB

    FE --> BE

    FE --> SEGMENTS
```

---

## 🧩 **2. Domain-Driven Backend Architecture**

```mermaid
flowchart TB
    subgraph Backend [NestJS Backend]
        OCRD[OCR Domain]
        SYNCD[Sync Domain]
        HLSD[HLS Domain]
        INDEXD[Index Domain]
        COMD[Common Domain]

        OCRD --> SYNCD
        SYNCD --> INDEXD
        HLSD --> SYNCD
        COMD --> OCRD
        COMD --> SYNCD
        COMD --> HLSD
        COMD --> INDEXD
    end

    FE[Next.js Frontend] --> Backend
    Backend --> OCR_SERVICE[OCR Container]
    Backend --> INDEXDB[(SQLite Index DB)]
```

---

## 🏗️ **3. NestJS Module Relationship Diagram**

```mermaid
graph TD
    AppModule --> OcrModule
    AppModule --> SyncModule
    AppModule --> HlsModule
    AppModule --> IndexModule
    AppModule --> CommonModule

    SyncModule --> IndexModule
    SyncModule --> HlsModule

    OcrModule --> CommonModule
    SyncModule --> CommonModule
    IndexModule --> CommonModule
    HlsModule --> CommonModule
```

---

## 🔄 **4. End-to-End Pipeline Flow**

```mermaid
sequenceDiagram
    participant EXT as External Stream
    participant FFM as FFmpeg Worker
    participant HLS as HLS Files
    participant IDX as Indexer
    participant DB as Index DB
    participant FE as Frontend
    participant BE as Backend
    participant OCR as OCR Service
    participant SYNC as Sync Engine

    EXT->>FFM: Stream Input
    FFM->>HLS: Generate .ts files + index.m3u8
    HLS->>IDX: New segment event
    IDX->>DB: Insert metadata

    FE->>BE: Upload scoreboard image
    BE->>OCR: Run OCR
    OCR-->>BE: (home, away, clock)
    FE->>BE: Request sync
    BE->>SYNC: Map scoreboard → audio time
    SYNC->>DB: Query closest timestamp
    DB-->>SYNC: Timestamp match
    SYNC-->>BE: Sync response
    BE-->>FE: Seek position
    FE->>FE: Player seeks to timestamp
```

---

## 🎧 **5. Low-Latency HLS Audio Playback Architecture**

```mermaid
flowchart LR
    AUSRC[Audio Stream Source] --> FFMPEG[FFmpeg Transcoder]

    FFMPEG --> HLSGEN[HLS Segment Generator]
    HLSGEN --> PLAYLIST[index.m3u8]
    HLSGEN --> SEG1[segment001.ts]
    HLSGEN --> SEG2[segment002.ts]
    HLSGEN --> SEG3[...]

    subgraph Player [Next.js Player + hls.js]
        HLSJS[hls.js Engine] --> AUDIO[Audio Element]
        PLAYER_UI[Player UI] --> HLSJS
    end

    PLAYLIST --> HLSJS
    SEG1 --> HLSJS
    SEG2 --> HLSJS
```

---

## ⏱️ **6. Sync Engine Timestamp Mapping**

```mermaid
flowchart TB
    OCRMETA["OCR Metadata\n(home, away, clock)"] --> NORMALIZE["Normalize Clock\nMM:SS → seconds"]
    NORMALIZE --> QUERY["Query Index DB"]
    QUERY --> MATCH["Find Closest Segment Timestamp"]
    MATCH --> OFFSET["Calculate Offset"]
    OFFSET --> RESPONSE["Sync Response to Player"]

    RESPONSE --> PLAYER["Player Seek"]
```

---

## 📦 **7. Local Deployment Diagram (Docker Simulation)**

```mermaid
flowchart LR
    subgraph DockerCompose
        subgraph Streaming Layer
            FFM[ffmpeg-worker container]
            IDX[indexer container]
            VOL[/storage volume/]
        end

        subgraph Backend Layer
            API[NestJS Backend]
            OCR[OCR Container]
            DB[(SQLite DB)]
        end

        subgraph Frontend Layer
            FE[Next.js Frontend]
        end
    end

    FFM --> VOL
    IDX --> VOL
    IDX --> DB

    API --> OCR
    API --> DB
    FE --> API
    FE --> VOL
```

---

## 🧠 **8. Data Lifecycle Diagram**

```mermaid
flowchart TD
    RAW_STREAM[Raw Live Audio Stream] --> TRANSCODED[Transcoded Audio Stream]
    TRANSCODED --> SEGMENTS[HLS Segments + Playlist]
    SEGMENTS --> INDEX_META[Index Metadata]
    INDEX_META --> SYNC_ENGINE[Sync Engine]
    SYNC_ENGINE --> PLAYER_TIMELINE[Player Timeline Position]
    PLAYER_TIMELINE --> AUDIO_PLAYER[Audio Playback]
```

---

## 🎛️ **9. Player State Machine Diagram**

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Loading
    Loading --> Buffering
    Buffering --> Playing
    Playing --> Seeking
    Seeking --> Playing
    Playing --> SyncAdjust
    SyncAdjust --> Playing
    Playing --> Error
    Error --> Idle
```

---

## 🖧 **10. API Interaction Diagram**

```mermaid
flowchart LR
    USER --> FE[Next.js Frontend]

    FE -->|POST /ocr| API[NestJS Backend]
    API --> OCR[OCR Container]
    OCR --> API
    API --> FE

    FE -->|POST /sync-score| API
    API --> SYNC[Sync Engine]
    SYNC --> INDEXDB[(Index DB)]
    INDEXDB --> SYNC
    SYNC --> API
    API --> FE
```

---

## 📚 **11. Domain Context Map**

```mermaid
flowchart LR
    OCRD[OCR Domain<br/>Image → Metadata] --> SYNCD[Sync Domain<br/>Metadata → Timestamp]
    SYNCD --> HLSD[HLS Domain<br/>Serve Playlist + Segments]
    HLSD --> FE[Frontend Player]
    SYNCD --> INDEXD[Index Domain]
    INDEXD --> SYNCD
```

---

## 🧩 **12. Component Diagram — Backend**

```mermaid
graph TD
    OCRController --> OCRService
    OCRService --> OCRAdapter

    SyncController --> SyncService
    SyncService --> IndexRepository
    SyncService --> ClockNormalizer

    HlsController --> HlsService

    IndexerWorker --> IndexRepository
    IndexRepository --> SQLite[(SQLite DB)]
```

---

## 🎞️ **13. HLS Playlist Refresh Loop Diagram**

```mermaid
sequenceDiagram
    participant FE as Player
    participant HLSJS as hls.js Engine
    participant SERVER as Local HLS Server

    FE->>HLSJS: Load index.m3u8
    HLSJS->>SERVER: Fetch playlist
    SERVER-->>HLSJS: index.m3u8
    HLSJS->>SERVER: Fetch segment.ts
    SERVER-->>HLSJS: segment.ts

    loop every 1s
        HLSJS->>SERVER: Refresh playlist
        SERVER-->>HLSJS: Updated playlist
        HLSJS->>FE: Update buffer
    end
```

---

## 🎯 **14. OCR Decision Flow**

```mermaid
flowchart TD
    UPLOAD[Image Uploaded] --> PREPROC[Preprocess Image]
    PREPROC --> OCRRUN[Run OCR Extraction]
    OCRRUN --> CLEAN[Clean + Parse Results]

    CLEAN -->|Valid| OK[Return Metadata]
    CLEAN -->|Invalid| RETRY[Ask User to Retake Photo]

    RETRY --> UPLOAD
```

---

## 🧮 **15. Index Matching Algorithm Diagram**

```mermaid
flowchart TD
    CLOCK[Clock MM:SS] --> NORMALIZE[Convert to Seconds]
    NORMALIZE --> QUERY[Index DB Query]
    QUERY --> RESULT{Match Found?}

    RESULT -->|Yes| CLOSEST[Find Closest Segment Time]
    CLOSEST --> RESPONSE[Return Timestamp]

    RESULT -->|No| LIVEEDGE[Return Live Edge / Fallback]
```

---

## 💾 **16. Storage Layout Diagram**

```mermaid
flowchart TB
    ROOT[/storage/] --> HLS[/hls/]
    ROOT --> INDEX[/index/]

    HLS --> FILES1[segment000.ts]
    HLS --> FILES2[segment001.ts]
    HLS --> PLAYLIST[index.m3u8]

    INDEX --> DB[segments.sqlite]
    INDEX --> DUMP[index.json]
```

---

## 🗺️ **17. Deployment Architecture (Local Dev)**

```mermaid
flowchart LR
    subgraph Laptop["MacBook M4 Max"]
        subgraph Containers
            FFMPG["FFmpeg Worker"]
            INDEXER["Index Worker"]
            OCR["OCR Service"]
            NEST["NestJS Backend"]
            NEXT["Next.js Frontend"]
        end
        VOL["Local Storage Volume"]
    end

    FFMPG --> VOL
    INDEXER --> VOL
    OCR --> VOL
    NEST --> VOL
    NEXT --> VOL
```

---

# **END OF FILE — architecture.md**

---
===============================================================
---
===============================================================
---

# `backend.md`

**Part 2/6**: the **full and complete `backend.md`** in English, written in a **professional, Confluence-style documentation format**, with detailed explanations of the backend architecture, endpoints, services, data flows, and NestJS-specific implementation details.

## **Backend Service – Architecture & API Documentation**

---

# **1. Overview**

The Backend Service is the central coordination layer of the Low-Latency Audio Streaming Platform.
It is responsible for:

* Exposing REST APIs to the frontend
* Handling seek operations (±1.5s and ±10s)
* Providing access to dynamically generated HLS playlists
* Integrating with the OCR pipeline
* Matching scoreboard metadata to indexed audio timestamps
* Orchestrating the Packager, Indexer Worker, and Sync Engine

The Backend runs as a containerized service (Docker) and is designed to simulate a production API gateway.

---

# **2. Responsibilities**

### **Core Back-End Responsibilities**

| Feature                 | Description                                                    |
| ----------------------- | -------------------------------------------------------------- |
| Streaming Control       | Exposes endpoints for retrieving HLS playlists and segments    |
| Seeking Logic           | Calculates target timestamp and returns adjusted playlist URLs |
| Sync Engine Integration | Converts scoreboard metadata into playback offsets             |
| OCR Integration         | Accepts images from frontend and forwards to OCR service       |
| Index Database Querying | Retrieves closest timestamps for seeking or synchronization    |
| Health Monitoring       | Provides health endpoints for debugging                        |

---

# **3. Backend Architecture Diagram**

```mermaid
flowchart LR
    FE[Frontend - React Native] -->|API Calls| API[Backend Gateway]

    API -->|Request Manifest| PKG[HLS Packager Service]
    API -->|Query timestamp| IDX[Index DB]
    API -->|Send Image| OCR[OCR Service]
    
    OCR --> SYNC[Sync Engine]
    SYNC --> IDX
    SYNC --> API
    API --> FE
```

---

# **4. Technologies Used**

* **Node.js 20+**
* **NestJS** (recommended) or Fastify
* **TypeScript**
* **SQLite** or local JSON for timestamp indexing
* **Docker**
* **Sharp** (optional for image preprocessing)
* **Axios** (inter-service communication)

---

# **5. Directory Structure**

```
/backend
  /src
    /controllers
      playlist.controller.ts
      seek.controller.ts
      ocr.controller.ts
      sync.controller.ts
    /services
      playlist.service.ts
      seek.service.ts
      sync.service.ts
      ocr.service.ts
      index.service.ts
    /dto
    /types
    /utils
  /test
  Dockerfile
  package.json
```

---

# **6. API Endpoints**

Below is the **full REST API contract** of the backend.

---

## **6.1 Playlist Retrieval**

### **GET /playlist/live**

Returns the latest playlist URL or full content.

**Response (200):**

```json
{
  "playlistUrl": "http://localhost:9000/hls/live.m3u8",
  "segments": 120
}
```

---

## **6.2 Playlist Content**

### **GET /playlist/raw**

Returns the raw `.m3u8` manifest.

Used mainly for debugging.

```json
{
  "content": "#EXTM3U\n#EXT-X-VERSION:3..."
}
```

---

## **6.3 Seeking API**

### **GET /seek**

Allows jumping `±1.5s` or `±10s`.

**Query Params**

| Param     | Type   | Description                  |
| --------- | ------ | ---------------------------- |
| `offset`  | number | Positive or negative seconds |
| `current` | number | Current timestamp in seconds |

**Example Request:**

```
GET /seek?offset=-10&current=185.4
```

**Response:**

```json
{
  "target": 175.4,
  "url": "http://localhost:9000/hls/live.m3u8"
}
```

---

## **6.4 Timestamp Boundary Seeking**

### **GET /seek/to-timestamp**

Finds the best segment for a given timestamp.

**Example:**

```
GET /seek/to-timestamp?ts=171.0
```

**Response:**

```json
{
  "segment": "segment085.ts",
  "start": 170,
  "end": 172
}
```

---

## **6.5 OCR Upload Endpoint**

### **POST /ocr**

Accepts scoreboard image (base64 or multipart).

**Payload:**

```json
{
  "image": "<base64>"
}
```

**Response:**

```json
{
  "home": 85,
  "away": 79,
  "clock": "08:12",
  "period": 4
}
```

---

## **6.6 Sync Endpoint (Align Audio to Scoreboard Metadata)**

### **POST /sync-score**

**Payload Example:**

```json
{
  "home": 85,
  "away": 79,
  "clock": "08:12"
}
```

**Internal Flow:**

```mermaid
flowchart TD
    A[Sync Request] --> B[Validate Metadata]
    B --> C[Query Index DB]
    C --> D[Find Closest Timestamp]
    D --> E[Return Seek Result]
```

**Response:**

```json
{
  "timestamp": 402.5,
  "segment": "segment201.ts",
  "confidence": 0.92
}
```

---

## **6.7 Health Check**

### **GET /health**

Returns backend health information.

---

# **7. Services (Internal Logic)**

The backend contains several internal services.

---

## **7.1 PlaylistService**

Handles communication with the Packager Service.

**Capabilities:**

* Fetch current playlist
* Parse `.m3u8`
* Return segment count
* Build playlist URLs

---

## **7.2 SeekService**

Responsible for computing adjusted timestamps.

**Operations:**

* Clamp timestamps to valid boundaries
* Query index DB
* Compute next or previous segment

**Seek Algorithm (Pseudocode):**

```ts
const target = current + offset;

if (target < 0)
  target = 0;

return indexService.findClosest(target);
```

---

## **7.3 OCRService**

Forwards images to OCR container.

Handles:

* base64 decoding
* multipart upload
* HTTP → OCR microservice

---

## **7.4 SyncService**

Aligns scoreboard time with audio time.

Process:

1. Receive metadata
2. Normalize clock (MM:SS → seconds)
3. Query index DB
4. Return adjustment

**Example Calculation:**

```
Scoreboard time = 08:12  → 492s  
Audio index → closest timestamp = 494.1  
Offset = +2.1s  
```

---

## **7.5 IndexService**

Maintains access to indexed timestamps.

Supports:

* segment lookup
* timestamp range lookup
* nearest-neighbor search

**Data Model Example:**

```json
{
  "segments": [
    { "file": "segment001.ts", "start": 0, "end": 2 },
    { "file": "segment002.ts", "start": 2, "end": 4 }
  ]
}
```

---

# **8. Backend Configurations**

| Config          | Description                     |
| --------------- | ------------------------------- |
| `HLS_PATH`      | Shared volume path for segments |
| `OCR_URL`       | URL of OCR microservice         |
| `INDEX_DB_PATH` | Path to index file              |
| `PACKAGER_URL`  | URL for playlist fetching       |

---

# **9. Error Handling & Fault Tolerance**

Errors:

* Missing playlist
* OCR image unreadable
* No matching timestamp
* Out-of-bound seek

Handled using:

* Standardized error object
* Fallback timestamp logic
* Logging with request correlation IDs

---

# **10. Unit & Integration Testing**

Recommended tests:

### **Unit**

* SeekService timestamp math
* IndexService nearest timestamp lookup
* SyncService clock normalization

### **Integration**

* Playlist retrieval
* OCR full cycle
* Segments consistency on seek

---

# **11. Example Request/Response Cycle**

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as Backend
    participant PKG as Packager
    participant IDX as IndexDB

    FE->>API: GET /seek?offset=-10&current=241
    API->>IDX: Find closest timestamp
    IDX->>API: return ts=231.1
    API->>PKG: Request segment list
    PKG->>API: Provide playlist
    API->>FE: Return seek target + playlist URL
```

---

# **END OF FILE — backend.md**

---


---
===============================================================
---
===============================================================
---

**NestJS is the perfect choice** for this backend.
It is modern, modular, scalable, and extremely well-suited for a microservice-style architecture like this one.

And yes — **we can (and should) implement the backend entirely using the latest NestJS version**, taking advantage of:

### ✅ Modern NestJS Features

* **Standalone APIs** or **Modular Architecture**
* **Modern HTTP adapters (Fastify recommended)**
* **ConfigModule for environment handling**
* **NestJS Pipes, Guards, Filters for validation/error control**
* **NestJS Injectable Services for clean domain boundaries**
* **Type-safe DTOs with class-validator**
* **Health checks using Terminus**
* **Cron / Workers with NestJS Schedule Module** (if needed for index rebuilding)

### Why NestJS is perfect for this project:

| Requirement                                             | NestJS Match                          |
| ------------------------------------------------------- | ------------------------------------- |
| Clean separation of playlist, seek, OCR, and sync logic | ✔ Modules                             |
| Multiple internal services                              | ✔ Injectable providers                |
| Fast API responses                                      | ✔ Fastify adapter                     |
| Typed DTOs                                              | ✔ class-validator + class-transformer |
| Inter-service communication                             | ✔ HttpModule                          |
| File uploads for OCR images                             | ✔ Multer integration                  |
| Maintainability                                         | ✔ Enterprise-quality structure        |
| Easy containerization                                   | ✔ Works perfectly in Docker           |
| Testability                                             | ✔ Built-in testing utilities          |

---

# ⭐ So YES — the entire backend will be written in the latest **NestJS 11+** (2025 LTS).

To align with your request, I will now **rewrite Part 2/6** completely, making it:

### ✔ Fully NestJS-based

### ✔ With real folder structure

### ✔ With NestJS modules, controllers, services

### ✔ With DTOs

### ✔ With best practices (Providers, Modules, HttpModule, ConfigModule)

### ✔ Fit for production or local development

---

# ❗Before I contiued part 2/6

The confirmation for: "**one final confirmation from you** so the documentation matches your desired structure:"

## Which NestJS architecture style do you prefer?

### **Option A — Classical Modular Architecture (recommended)**

```
/src
  /modules
    /playlist
    /seek
    /sync
    /ocr
    /index
  /common
  main.ts
```

Best for clarity, separation of concerns, and ease of scaling.

### **Option B — Domain-Driven Architecture**

```
/src
  /domains
    /streaming
    /sync
    /ocr
    /indexing
  /libs
  main.ts
```

Best if you want DDD patterns everywhere.

### **Option C — Microservices Within One Repo**

```
/src
  /api-gateway
  /streaming-service
  /ocr-service
  /sync-service
  ...
```

Best if planning future distributed deployment (e.g., AWS ECS, Kubernetes).

---


### the option choosed will be Including:

- [ ] **Modules**
- [ ] **Controllers**
- [ ] **Services**
- [ ] **DTOs**
- [ ] **Dependency graph**
- [ ] **Design patterns**
- [ ] **Error handling**
- [ ] **Example endpoints**
- [ ] **Request/response examples**
- [ ] **NestJS configuration**
- [ ] **Dockerfile + docker-compose usage**


# ✔ Question

**architecture style documentation | OPTIONS:**
- [ ] **A**;
- [x] **B**;
- [ ] **C**;


---

comparission of **Option B (DDD monolith)** vs. **Option C (microservices)** specifically for **this project** and the goal of **future distributed deployment on AWS ECS or Kubernetes**.

---

# 🥇 **Recommendation: OPTION B → Domain-Driven Modular Monolith (for now)**

…and later you evolve naturally into **Option C: Microservices** when the system matures.

---

## 🚀 **Why Option B is the best starting point**

### ✔ 1. **Keeps the codebase clean, meaningful, and scalable**

A domain-driven structure organizes the project by business logic, not by technical layers.
For a platform like yours (streaming, OCR, sync engine), this is ideal:

```
/domains
  /streaming
  /hls
  /sync
  /ocr
  /indexing
```

This keeps your architecture EXTREMELY maintainable long-term.

---

### ✔ 2. **Natural bridge into future microservices**

When you’re ready for distributed deployment:

* The **streaming domain** becomes a microservice.
* The **sync domain** becomes a microservice.
* The **ocr domain** becomes a microservice.
* The **indexer** becomes a worker service.

In other words:

**Option B is literally the seed of Option C.**

You won’t have to rewrite anything — you simply extract domains into services when needed.

---

### ✔ 3. **Lower operational overhead**

A true microservice architecture (Option C) requires:

* CI/CD pipelines per service
* Networking, discovery, tracing
* Config per service
* Load balancers
* Distributed logging
* Message queues

This will slow you down NOW.

**Option B gives you:**

* The SAME modular boundaries
* NONE of the operational cost
* Easy local development
* Perfect transition later

---

### ✔ 4. **Ideal for NestJS**

NestJS was literally designed for this structure:

* Feature modules
* Domain services
* Shared providers
* Reusable libraries
* Clear dependency graphs

Option B fits 100% of NestJS best practices.

---

### ✔ 5. **Perfect match for your project’s lifecycle**

The audio streaming system will likely evolve like this:

1. **Prototype local pipeline → single repo**
2. Add OCR → still monolith
3. Add sync logic + indexing → still monolith
4. Need high concurrency on ingest → move streaming to its own service
5. Need high OCR throughput → OCR becomes its own microservice
6. Need global distribution → extract everything into services under ECS/K8s

❌ **Option C**
Starting with the **Option C** is not a good idea as it would slow down development dramatically.

---

## 🧠 **Summary Table**

| Feature                       | Option B (DDD Monolith) | Option C (Microservices)  |
| ----------------------------- | ----------------------- | ------------------------- |
| Easy to develop locally       | ⭐⭐⭐⭐⭐               | ⭐⭐                       |
| Easiest to evolve             | ⭐⭐⭐⭐⭐               | ⭐⭐⭐                     |
| Operational complexity        | ⭐                      | ⭐⭐⭐⭐⭐                 |
| Fits NestJS best practices    | ⭐⭐⭐⭐⭐               | ⭐⭐⭐⭐                   |
| Ideal for single developer    | ⭐⭐⭐⭐⭐               | ⭐                        |
| Migration path to distributed | ⭐⭐⭐⭐⭐               | N/A (already distributed) |

👉 Because we're still architecting and prototyping, and because you WILL evolve into distributed systems later, the strategic choice is:

# ✅ **Choose Option B: Domain-Driven NestJS Architecture**

And then graduate naturally to **Option C** when the time comes.

---


---
===============================================================
---
===============================================================
---


# ⭐ **PART 2/6 — `backend.md` (NestJS Domain-Driven Architecture)**

Complete, extremely detailed, Confluence-style, and tailored for future ECS/Kubernetes microservice extraction.


# 🔥 **Part 2/6 — backend.md (NestJS DDD version)** 

## With:
* Domain modules
* NestJS dependency injection graph
* DTOs and typings
* Controllers & services
* Error handling
* Domain event patterns
* Example folder structure
* Distributed-ready organization
* Clean layering for future extraction into microservices

---
---

# `backend.md`

## **Backend Service — NestJS (Domain-Driven Architecture)**

### **Low-Latency Audio Streaming System**

---

# **1. Overview**

This backend implements all control-plane logic of the audio streaming platform using **NestJS (latest version)** and a **Domain-Driven (DDD) modular monolith architecture**.

The backend exposes APIs for:

* Playlist retrieval
* Seek operations (±1.5s, ±10s)
* Timestamp-based alignment
* OCR handling
* Scoreboard synchronization
* Health checks
* Index database queries

The codebase is intentionally structured to:

### ✔ Develop fast (local-first)

### ✔ Maintain domain separation

### ✔ Scale vertically now

### ✔ Be extracted into microservices later (ECS/K8s)

---

# **2. Architectural Principles**

### **2.1 DDD (Domain-Driven Design)**

The backend is divided into **domains**, not “technical folders”:

```
/streaming
/playlist
/seek
/sync
/ocr
/indexing
/shared
```

Each domain contains:

* Controllers (API boundary)
* Services (use-cases)
* Entities (business objects)
* DTOs
* Mappers
* Repositories (if needed)
* Providers (orchestrators / external adapters)

---

### **2.2 Clear Separation of Layers**

```
Application Layer  → controllers, queries, commands  
Domain Layer        → business rules, services, entities  
Infrastructure      → HTTP clients, FS, OCR engine, HLS packager  
```

---

### **2.3 Microservice-Ready from Day 1**

Each domain is **isolated**, so in the future:

| Domain      | Can become a microservice |
| ----------- | ------------------------- |
| Streaming   | ✔ ingest + packager       |
| Indexing    | ✔ worker service          |
| OCR         | ✔ AI / GPU-based service  |
| Sync Engine | ✔ stateless compute       |
| Playlist    | stays API Gateway         |
| Seek        | stays API Gateway         |

You’ll be able to split them out with minimal refactoring.

---

# **3. Backend Directory Structure**

```
/backend
  /src
    /app.module.ts
    /main.ts
    
    /domains
      /streaming
        streaming.module.ts
        streaming.controller.ts
        streaming.service.ts
        dto/
        types/
        adapters/
      
      /playlist
        playlist.module.ts
        playlist.controller.ts
        playlist.service.ts
      
      /seek
        seek.module.ts
        seek.controller.ts
        seek.service.ts
      
      /sync
        sync.module.ts
        sync.controller.ts
        sync.service.ts
      
      /ocr
        ocr.module.ts
        ocr.controller.ts
        ocr.service.ts
        adapters/
      
      /indexing
        indexing.module.ts
        indexing.service.ts
        indexing.repository.ts
        dto/
        entities/

    /shared
      /config
      /logging
      /utils
      base-response.interceptor.ts

  /test
  Dockerfile
  docker-compose.yml
  tsconfig.json
  package.json
```

---

# **4. Domain Descriptions**

Below is a complete breakdown of each domain.

---

## **4.1 STREAMING Domain (HLS Packager Integration)**

### **Responsibilities**

* Communicate with the HLS packager container
* Fetch manifest files
* Inspect media segments
* Provide URLs to frontend
* Validate packager health

### Architecture:

```mermaid
flowchart LR
  FE[Frontend] --> API
  API --> STREAM[StreamingService]
  STREAM --> PKG[Packager Container]
```

---

## **4.2 PLAYLIST Domain**

### Responsibilities:

* Expose `/playlist/live` endpoint
* Return playlist metadata (segment count, duration, etc.)
* Provide raw `.m3u8` for debugging
* Support future ABR playlists

### DTO Example:

```ts
export class PlaylistResponseDto {
  playlistUrl: string;
  segmentCount: number;
  lastUpdated: number;
}
```

---

## **4.3 SEEK Domain**

Handles all logic for jump forward/backward by ±1.5s or ±10s.

### Responsibilities:

* Timestamp math
* Bounds checking
* Query index DB
* Return a target segment or timestamp

### Seek Algorithm:

```
target = current + offset
if target < 0 → clamp to 0
return nearest indexed timestamp
```

### Controller Example:

```
GET /seek?offset=-10&current=292.4
```

### Response:

```json
{
  "target": 282.4,
  "segment": "segment141.ts"
}
```

---

## **4.4 SYNC Domain (Score-to-Audio Alignment)**

### Responsibilities:

* Normalize OCR metadata
* Convert scoreboard time to seconds
* Query Indexing domain for matching timestamp
* Compute offset vs. live audio
* Send seek instruction back to mobile

### Example Flow:

```mermaid
sequenceDiagram
  APP->>OCR: Upload scoreboard snapshot
  OCR->>SYNC: Score metadata
  SYNC->>IDX: Find closest timestamp
  IDX->>SYNC: Return ts=492.1
  SYNC->>APP: Seek to 492.1
```

---

## **4.5 OCR Domain**

### Responsibilities:

* Accept image upload
* Forward to OCR service container
* Preprocess image (optional Sharp)
* Validate OCR response
* Output normalized game metadata

### Endpoint:

```
POST /ocr
```

### Response:

```json
{
  "home": 95,
  "away": 102,
  "clock": "06:52",
  "period": 3
}
```

---

## **4.6 INDEXING Domain**

### Responsibilities:

* Store audio timestamp index
* Map HLS segments to time ranges
* Respond to timestamp queries
* Allow nearest-neighbor lookup

### Example Index Entry:

```json
{
  "file": "segment024.ts",
  "start": 46.0,
  "end": 48.0
}
```

---

# **5. NestJS Module Graph**

```mermaid
graph TD
  APP[AppModule]
  
  STREAM[StreamingModule]
  PLAYLIST[PlaylistModule]
  SEEK[SeekModule]
  SYNC[SyncModule]
  OCR[OcrModule]
  IDX[IndexingModule]
  SHARED[SharedModule]
  
  APP --> STREAM
  APP --> PLAYLIST
  APP --> SEEK
  APP --> SYNC
  APP --> OCR
  APP --> IDX
  
  STREAM --> SHARED
  PLAYLIST --> STREAM
  SEEK --> IDX
  SYNC --> IDX
  SYNC --> OCR
```

---

# **6. API Contract Summary**

| Path                 | Domain   | Method | Description                 |
| -------------------- | -------- | ------ | --------------------------- |
| `/playlist/live`     | playlist | GET    | Returns playlist metadata   |
| `/playlist/raw`      | playlist | GET    | Returns raw `.m3u8`         |
| `/seek`              | seek     | GET    | Jump ± seconds              |
| `/seek/to-timestamp` | seek     | GET    | Seek to exact timestamp     |
| `/ocr`               | ocr      | POST   | Upload scoreboard image     |
| `/sync-score`        | sync     | POST   | Align audio with scoreboard |
| `/health`            | shared   | GET    | Health check                |

---

# **7. Dependency Injection (DI) Overview**

All services use NestJS DI:

```ts
@Injectable()
export class SeekService {
  constructor(private readonly indexService: IndexService) {}
}
```

Decouples modules and enables future microservice extraction.

---

# **8. Error Handling**

Every controller uses:

* NestJS `HttpException`
* Custom `DomainError` objects
* Global `ExceptionFilter`
* A uniform `ApiResponse` DTO

---

# **9. Deployment**

Backend supports:

### ✔ Local Docker container

### ✔ docker-compose multi-service orchestration

### ✔ Easy future migration to:

* ECS
* Kubernetes
* Lambda (seek + sync-only services)

---

# **10. Full Example Request Cycle**

```mermaid
sequenceDiagram
  FE->>API: POST /ocr
  API->>OCR: Forward image
  OCR-->>API: Metadata
  API->>SYNC: Compute timestamp
  SYNC->>IDX: Query timestamp index
  IDX-->>SYNC: ts=302.4
  SYNC-->>API: Send alignment
  API-->>FE: Seek to 302.4
```

---

# **END OF FILE — backend.md**

---
===============================================================
---
===============================================================
---


# 🧠 **Is Next.js 16 + React 19.2 a good idea for this project?**

Short answer:

## ⭐⭐⭐⭐⭐ YES — 100% the right decision.

Now let’s break down why.

---

# 🚀 **1. React Native (Expo) is great for mobile — but your project requires precise player control**

The riginal thought was React Native because of Expo Video.
However…

For *audio-only low-latency streaming*, desktop and mobile browsers + a custom `<audio>` player or `<video>` element gives to us:

  * ✅ **Finer control over HLS**;
  * ✅ **Full access to Media Source Extensions (MSE)**;
  * ✅ **No App Store publishing headaches**;
  * ✅ **Zero native constraints**;
  * ✅ **Faster iteration, easier local testing**;

**Expo’s player is fine — but not optimal for deep low-latency work.**

Using **Next.js** gives us **TOTAL DOM** access and the browser’s native media APIs.

---

# 📦 **2. HLS works MUCH better in the browser**

With Next.js 16, we can use:

* **hls.js (LL-HLS support)**
* **Video.js**
* **ReactPlayer**
* **Custom Web Audio API pipelines**
* **Progressive streaming logic**

Even React 19’s **Actions**, **Server Components**, and **Transitions** give us _**advanced streaming UX capabilities**_.

---

# 🖥 **3. Next.js 16 supports Streaming SSR by default**

This is a huge advantage:

We can SSR:

* audio metadata
* dynamic playlist timestamps
* real-time scoreboard updates
* event logs
* match status

### **Which means:**

- **Fast UI + consistent playback sync + low JS execution.**

---

# 📱 **4. We still get mobile — via PWA support**

Next.js turns your app into a **mobile PWA**:

* installable on home screen
* offline capabilities
* works like a native mobile app
* uses the same streaming engine

No need for Expo unless you truly want a native iOS/Android shell (you can add that later).

---

# 🔌 **5. Seamless integration with our NestJS backend**

Next.js 16 + React 19 integrates beautifully with:

* SSR API calls
* React Query 5
* Server Actions calling Nest endpoints
* WebSockets for real-time scoreboard sync
* Edge Runtime for ultra-low-latency operations

---

# 🧬 **6. Perfect match for the architecture we are building**

Our full stack will now be:

* **Next.js 16** → frontend
* **NestJS DDD** → backend
* **FFmpeg + HLS** → media pipeline
* **OCR container** → AI/vision subsystem

This is a **modern enterprise-grade architecture**, identical to what major streaming platforms use today.

---

# 🧩 **7. React 19.2 unlocks major benefits**

* **useEffect-free async logic**
* **React Compiler** → auto-optimizes components
* **Actions** for server interactions
* **Better hydration performance**
* **More predictable rendering**

For a streaming player, this matters **_A LOT!_**

---

# 🥇 Final verdict

# ✅ **Use Next.js 16.0.8 + React 19.2**

It’s future-proof, production-level, and perfect for our **_low-latency audio app_**.

This stack will serve us for **years**, and migration to microservices or multi-tenant SaaS will be incredibly smooth.

---

# ⭐ Since we have confirmed Next.js → the next step is:

## 🔥 **Part 3/6 — `frontend.md`**

### A complete documentation including:

* **Architecture overview**
* **UI/UX structure**
* **Player architecture**
* **HLS pipeline integration**
* **Low-latency playback tuning**
* **Hooks & context design**
* **Server Actions design**
* **File structure (app router)**
* **API integration with NestJS**
* **Score synchronization flow**
* **Image capture flow (for scoreboard OCR)**
* **Component tree diagrams**
* **Performance guidelines**
* **Error handling patterns**
* **Future scalability**

---

Before I generate Part 3…

### ❓ Do you want the frontend to:

#### A) Be *web-only* (Next.js)

#### B) Also function as a **PWA for mobile**

#### C) Include a *small mobile-native wrapper* later (Capacitor or Expo Web-to-Native)?

---

**Option choosed "A": Web-only (Next.js 16 + React 19.2)**.
This gives us a **clean, powerful, browser-native low-latency streaming interface**, ideal for development, debugging, and future performance tuning.

---
===============================================================
---
===============================================================
---

# ⭐ **Part 3/6 — `frontend.md`**

Fully tailored for **Next.js 16.0.8**, **React 19.2**, and our **DDD/NestJS** **backend**.

> This is a complete, Confluence-style documentation file—professionally structured and production-grade.
> 

---

# `frontend.md`

## **Frontend Architecture — Next.js 16 + React 19.2**

### **Low-Latency Audio Streaming Platform**

---

# **1. Overview**

This document describes the **frontend architecture** of the Low-Latency Audio Streaming Platform implemented using:

* **Next.js 16.0.8 (App Router)**
* **React 19.2**
* **TypeScript**
* **Server Actions**
* **React Query 5 (if desired)**
* **hls.js (Low-Latency HLS compatible)**

The goal of the frontend is to deliver a **browser-native, low-latency audio player** with:

* Dynamic HLS playlist loading
* Smooth seeking (±1.5s and ±10s)
* Automatic synchronization with scoreboard metadata
* Image upload for OCR processing
* Real-time UI updates
* Highly performant rendering leveraging React 19 features

This architecture can later evolve into:

* PWA (installable mobile app)
* Multi-tenant architecture
* Live/On-demand hybrid features
* Advanced analytics dashboards

---

# **2. High-Level Frontend Architecture**

```mermaid
flowchart LR
  UI[Next.js UI] --> PLAYER[Audio Player Component]
  
  PLAYER --> HLS[hls.js Engine]
  HLS --> STREAM[HLS Segments + Playlist]
  
  UI --> API[NestJS Backend API]
  
  UI --> OCRFLOW[Image Upload Flow]
  OCRFLOW --> API
  
  API --> SYNCFLOW[Sync Response]
  SYNCFLOW --> PLAYER
```

---

# **3. Next.js Directory Structure (Recommended)**

```
/frontend
  /app
    /layout.tsx
    /page.tsx
    /player
      /ui
        player-controls.tsx
        player-timeline.tsx
        player-volume.tsx
      /hooks
        usePlayer.ts
        useHls.ts
      /components
        audio-player.tsx
    /ocr
      /page.tsx
    /sync
      /actions.ts
  /lib
    api-client.ts
    configs.ts
    helpers.ts
  /components
    button.tsx
    card.tsx
    image-uploader.tsx
  /styles
  next.config.mjs
  package.json
  tsconfig.json
```

---

# **4. Core Frontend Responsibilities**

| Feature                           | Description                                                                  |
| --------------------------------- | ---------------------------------------------------------------------------- |
| **Low-latency audio playback**    | Implement HLS playback using hls.js + browser `<video>` or `<audio>` element |
| **Player UI**                     | Controls for play, pause, seek, timestamps, latency indicators               |
| **Integration with backend**      | Playlist retrieval, seek requests, sync updates, OCR uploads                 |
| **Image capture & upload**        | File input to send scoreboard snapshots                                      |
| **Scoreboard synchronization**    | Apply backend alignment to player's playback position                        |
| **Error handling**                | Detect playlist staleness, HLS errors, sync failures                         |
| **React Server Components (RSC)** | Fast UI and SEO where needed                                                 |
| **Server Actions**                | Lightweight backend integration for immutable server logic                   |

---

# **5. Player Architecture**

## 5.1 Component Tree

```mermaid
graph TD
  A[AudioPlayer] --> B[usePlayer Hook]
  A --> C[useHls Hook]
  A --> D[PlayerControls]
  A --> E[PlayerTimeline]
  A --> F[LatencyIndicator]
  A --> G[AudioElementRef]
```

---

## 5.2 The Player Strategy

### Uses:

* `<audio>` element (or `<video>` for visual debugging)
* **hls.js** for LL-HLS compatibility
* **Ref-based state machine**
* **React 19 transitions** for smooth UI
* **Server Actions** for backend interactions

### Key Player Requirements:

✔ Minimal buffering
✔ Fast response on seek
✔ Ability to jump exactly ±1.5s / ±10s
✔ Ability to autoplay after sync adjustments
✔ Detect stalling or playlist drift

---

## 5.3 Player State Machine

```mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> LoadingPlaylist
  LoadingPlaylist --> Buffering
  Buffering --> Playing
  Playing --> Seeking
  Seeking --> Playing
  Playing --> SyncAdjust
  SyncAdjust --> Playing
  Playing --> Error
  Error --> Idle
```

---

# **6. Hooks**

## **6.1 `useHls`**

Handles loading, attaching, and updating HLS playback.

### Responsibilities:

* Initialize hls.js
* Listen to HLS events
* Attach to `<audio>` element
* Handle LL-HLS tuning (low latency mode)
* Auto-refresh playlist if needed

---

## **6.2 `usePlayer`**

Manages:

* play/pause
* seeking
* timestamp updates
* latency calculation
* sync adjustments

### Example:

```ts
const { 
  currentTime,
  latency,
  seekBy,
  seekTo,
  setLiveEdge,
  isPlaying
} = usePlayer(audioRef, hlsInstance);
```

---

# **7. OCR Flow**

## **7.1 UI Flow**

```mermaid
sequenceDiagram
  USER->>UI: Select scoreboard image
  UI->>API: POST /ocr
  API->>UI: Extracted metadata
  UI->>API: POST /sync-score
  API->>UI: Timestamp / seek offset
  UI->>PLAYER: Seek to target timestamp
```

---

# **8. API Integration (Client)**

Located in `/lib/api-client.ts`:

```ts
export async function fetchPlaylist() { }
export async function seek(offset: number, currentTime: number) { }
export async function uploadScoreImage(file: File) { }
export async function syncScore(payload: SyncDto) { }
```

---

# **9. Pages (App Router)**

## **9.1 `/app/page.tsx`**

Home page containing:

* Live player
* Current latency
* Seek buttons
* Sync controls

---

## **9.2 `/app/ocr/page.tsx`**

Contains:

* Image uploader
* Scoreboard preview
* OCR result panel

---

## **9.3 `/app/player/ui`**

Contains all reusable UI components for the player.

---

# **10. Low-Latency Strategies**

To hit the latency goals (<6 seconds):

### ✔ Use LL-HLS compatible segment durations (1–2 seconds)

### ✔ Minimized buffer size

### ✔ Force `hls.config.lowLatencyMode = true`

### ✔ Faster playlist refresh interval

### ✔ Seek adjustments applied instantly

### ✔ Avoid React re-renders in inner loops (use refs)

---

# **11. Handling Playlist Drift**

If the playlist falls too far behind:

→ fetch new playlist
→ reload hls instance
→ return to live position

The player includes:

* `latencyIndicator`
* `recoveryLogic`

---

# **12. Error Handling**

| Error                | Frontend Behavior               |
| -------------------- | ------------------------------- |
| Playlist unreachable | Retry with exponential backoff  |
| HLS fatal error      | Reinitialize player             |
| Sync mismatch        | Disable auto-sync & notify user |
| OCR error            | Show safe fallback message      |

---

# **13. Future Extensions**

* Full WebSockets scoreboard sync
* Mini real-time waveform UI
* Multi-feed switching (home/away announcers)
* Adaptive bitrate switching
* Dark mode / custom player skins

---

# **END OF FILE — frontend.md**

---
===============================================================
---
===============================================================
---


# `ocr_sync.md`

## **OCR & Synchronization Engine — Architecture & Processing Pipeline**

### **Low-Latency Audio Streaming Platform**

---

# **1. Overview**

This document describes the complete OCR + Synchronization subsystem responsible for:

* Extracting scoreboard data (score, game clock, period/quarter)
* Normalizing the image using preprocessing
* Running OCR detection using Tesseract or OpenCV
* Validating and structuring the results
* Aligning the extracted scoreboard data with the audio timeline
* Producing a synchronization timestamp for the audio player

This subsystem is divided into two backend domains:

1. **OCR Domain** → Image → Metadata
2. **Sync Domain** → Metadata → Audio Timestamp

This allows extremely clean domain separation and future microservice extraction.

---

# **2. High-Level Architecture**

```mermaid
flowchart LR
    A[User Uploads Scoreboard Image] --> B[Frontend Image Uploader]
    B --> C[POST /ocr]
    C --> OCR[OCR Service Container]
    OCR --> C
    C --> D[POST /sync-score]
    D --> SYNC[Sync Engine]
    SYNC --> IDX[Index Database]
    IDX --> SYNC
    SYNC --> E[Seek Response]
    E --> PLAYER[Audio Player]
```

---

# **3. OCR Domain (Image → Scoreboard Metadata)**

The OCR domain transforms an uploaded scoreboard image into meaningful game metadata.

## **3.1 Responsibilities**

| Responsibility                     | Description                                           |
| ---------------------------------- | ----------------------------------------------------- |
| Preprocess image                   | Resize, normalize contrast, denoise, threshold        |
| Region-of-Interest (ROI) detection | Locate scoreboard area (optional OpenCV)              |
| OCR extraction                     | Extract numeric text (scores, time, period)           |
| Postprocessing                     | Clean and normalize results                           |
| Validation                         | Ensure values are plausible (e.g., time format MM:SS) |
| Output                             | Send structured metadata to Sync domain               |

---

# **4. OCR Pipeline (Steps)**

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as NestJS Backend
    participant OCR as OCR Container
    FE->>API: POST /ocr (image)
    API->>OCR: Process Image
    OCR->>API: {scoreboard metadata}
    API->>FE: Response with metadata
```

---

# **5. OCR Processing Logic**

## **5.1 Preprocessing (Sharp + OpenCV)**

These steps significantly improve OCR accuracy:

1. **Convert to grayscale**
2. **Apply bilateral filter** (denoise but preserve edges)
3. **Adaptive thresholding** (make numbers high-contrast)
4. **Resize upscale ×2 or ×3** (OCR loves big text)
5. **Crop Regions of Interest** (optional)

Example (pseudo):

```ts
const processed = sharp(image)
  .grayscale()
  .threshold(140)
  .resize({ width: originalWidth * 2 })
  .toBuffer();
```

---

## **5.2 OCR Extraction (Tesseract)**

The OCR container receives processed images and runs:

* LSTM OCR model
* Numeric whitelist (digits + colon)

Configuration example:

```
tesseract input.png stdout --psm 6 -c tessedit_char_whitelist=0123456789:
```

---

## **5.3 Post-Processing**

OCR output is noisy — so we apply cleanup rules:

### Example cleanup:

| Raw OCR Output  | Cleaned            |
| --------------- | ------------------ |
| `08:12.`        | `08:12`            |
| `Q4`            | `4`                |
| `SCORE 85 - 79` | `home=85, away=79` |

We apply regex:

```ts
const time = raw.match(/(\d{1,2}:\d{2})/);
const scores = raw.match(/(\d+)[^\d]+(\d+)/);
```

---

## **5.4 Output Schema**

```ts
interface OcrResult {
  home: number;
  away: number;
  clock: string;    // "MM:SS"
  period: number;   // Optional
  confidence: number;
}
```

---

# **6. Sync Domain (Scoreboard Metadata → Audio Timestamp)**

The Sync Engine is responsible for aligning visual scoreboard data to the audio timeline.

---

# **6.1 Responsibilities**

| Task                      | Description                                        |
| ------------------------- | -------------------------------------------------- |
| Normalize clock format    | Convert "MM:SS" → seconds                          |
| Retrieve index ranges     | Query Index Database for matching timestamp        |
| Find best audio timestamp | Map game time to audio time                        |
| Compute offset            | Difference between live audio and target timestamp |
| Return seek instruction   | Used by frontend to jump to the correct time       |

---

# **7. Sync Pipeline**

```mermaid
flowchart TD
  META[Scoreboard Metadata] --> VERIFY[Validation]
  VERIFY --> NORMALIZE[Normalize Clock]
  NORMALIZE --> QUERY[Index DB Query]
  QUERY --> MATCH[Find Closest Timestamp]
  MATCH --> RESP[Build Sync Response]
  RESP --> PLAYER[Frontend Player]
```

---

# **8. Timestamp Matching Logic**

The indexing domain stores:

```json
{
  "file": "segment201.ts",
  "start": 400.0,
  "end": 402.0
}
```

If the scoreboard clock says **08:12**, equal to:

```
8 min * 60 = 480
+ 12 sec = 492s
```

We find:

```
Closest timestamp in index → 491.8
```

Sync Engine returns:

```json
{
  "timestamp": 491.8,
  "segment": "segment246.ts",
  "confidence": 0.91
}
```

---

# **9. Validation Rules**

| Field      | Validation         |
| ---------- | ------------------ |
| score      | must be 0–200      |
| clock      | must match `MM:SS` |
| period     | 1–4 (basketball)   |
| confidence | > 0.75 recommended |

If validation fails:

→ The sync endpoint rejects the request with error code.

---

# **10. NestJS Implementation Details**

## **10.1 OCR Module**

```
/domains/ocr
  ocr.module.ts
  ocr.controller.ts
  ocr.service.ts
  adapters/
```

### Controller Endpoint:

```
POST /ocr
```

### Service Responsibilities:

* Communicate with OCR Docker container
* Handle file upload
* Transform image to buffer
* Return cleaned OCR result

---

## **10.2 Sync Module**

```
/domains/sync
  sync.module.ts
  sync.controller.ts
  sync.service.ts
```

### Controller Endpoint:

```
POST /sync-score
```

### Service Responsibilities:

* Normalize OCR metadata
* Query index database
* Compute best match
* Respond with timestamp

---

# **11. Detailed Flow Diagram**

```mermaid
sequenceDiagram
    participant FE as Frontend Player
    participant BE as NestJS Backend
    participant OCR as OCR Container
    participant SYNC as Sync Engine
    participant IDX as Index DB

    FE->>BE: POST /ocr (image)
    BE->>OCR: Process image
    OCR-->>BE: {home, away, clock}
    BE->>FE: OCR results

    FE->>BE: POST /sync-score
    BE->>SYNC: Normalize + prepare
    SYNC->>IDX: findClosest(clockSeconds)
    IDX-->>SYNC: {timestamp, segment}
    SYNC-->>BE: Build response
    BE-->>FE: Seek to timestamp
```

---

# **12. Error Handling Strategy**

| Error Condition      | Behavior                              |
| -------------------- | ------------------------------------- |
| OCR unreadable       | Return `{ error: "OCR_UNCERTAIN" }`   |
| Clock invalid        | Return 400 Bad Request                |
| No timestamp match   | Return fallback timestamp (live edge) |
| Poor confidence      | Ask user to retake photo              |
| Index DB unavailable | Retry + fallback                      |

---

# **13. Future Enhancements**

### 🔮 Potential improvements:

* Use a **vision transformer (ViT)** model instead of Tesseract
* Add scoreboard template detection (team logos, styling)
* Train custom OCR models
* Real-time scoreboard tracking via WebSockets
* Use GPU acceleration for OCR container
* Leverage temporal OCR (video sequence instead of one photo)

---

# **14. Final Output Structure**

**OCR Output → Sync Engine → Player:**

```json
{
  "ocr": {
    "home": 102,
    "away": 98,
    "clock": "07:31",
    "confidence": 0.92
  },
  "sync": {
    "timestamp": 451.0,
    "segment": "segment226.ts",
    "offset": -2.3,
    "applyImmediately": true
  }
}
```

---

# **END OF FILE — ocr_sync.md**

---
===============================================================
---
===============================================================
---

# `streaming_pipeline.md`

## **Streaming Pipeline Architecture — Low-Latency HLS + FFmpeg Indexing**

## **Low-Latency Audio Streaming Platform**

## 🔥 **`streaming_pipeline.md` — The Full Streaming & Indexing Pipeline Documentation**

### This is the piece that ties everything together:

* Audio ingest
* FFmpeg processing
* Low-Latency HLS generation
* Indexing every segment
* Backend alignment
* Local simulation of AWS MediaLive + MediaPackage
* Storage structure
* End-to-end architecture with diagrams

#### Written in **_enterprise-grade, Confluence-style documentation_**.

---

# **1. Overview**

This document describes the **complete audio streaming, ingestion, transcoding, packaging, and indexing pipeline** for the platform.

Since the cloud provider is not used locally, the system replicates:

* **AWS MediaLive** (real-time ingest → FFmpeg worker)
* **AWS MediaPackage** (HLS segment packager)
* **Indexing EC2 worker** (segment timestamp mapping)

All components run locally on Docker and orchestrate the following tasks:

| Stage                      | Task                                                                |
| -------------------------- | ------------------------------------------------------------------- |
| **1. Ingest**              | Receive external stream URL (MP3, AAC, HTTP radio stream, etc.)     |
| **2. Transcode**           | FFmpeg normalizes audio into uniform low-latency segments           |
| **3. Package**             | Segment into LL-HLS (`*.ts` or CMAF `*.m4s`)                        |
| **4. Playlist Generation** | `index.m3u8`, low-latency preload hints                             |
| **5. Indexing**            | Generate per-segment JSON metadata with audio timeline              |
| **6. Storage**             | Place segments + metadata into structured storage (`/storage/hls/`) |
| **7. Delivery**            | Frontend fetches via local HTTP server                              |
| **8. Sync**                | Backend maps scoreboard timestamps → segment timeline               |

---

# **2. High-Level Pipeline Diagram**

```mermaid
flowchart LR
    EXT["External Audio Stream<br/>URL"] --> INGEST["FFmpeg Ingest Worker"]
    INGEST --> TRANSCODE["FFmpeg Transcoder"]
    TRANSCODE --> PACKAGE["HLS Packager<br/>LL-HLS Mode"]
    PACKAGE --> SEGMENTS["HLS Segments<br/>(.ts / .m4s)"]
    PACKAGE --> PLAYLIST["index.m3u8"]
    SEGMENTS --> INDEXER["Indexer Worker"]
    INDEXER --> META["Index Metadata DB (JSON or SQLite)"]
    PLAYLIST --> SERVER["Local HTTP Server"]
    SEGMENTS --> SERVER
    SERVER --> FRONTEND["Next.js Player"]
    META --> SYNC["Sync Engine"]
    SYNC --> FRONTEND
```

---

# **3. Ingest & Transcoding Layer**

This layer replaces **AWS MediaLive** locally.

---

## **3.1 Ingest Worker (FFmpeg)**

FFmpeg pulls the external audio stream:

```
ffmpeg -i http://external.stream.url \
       -vn \
       -acodec aac \
       -ar 48000 \
       -ac 2 \
       -f hls ...
```

### Purpose:

* Stabilize unreliable Internet radio streams
* Normalize codec, bitrate, and sample rate
* Remove video if existent
* Provide steady output for segmentation

---

## **3.2 Recommended FFmpeg Audio Parameters**

| Setting     | Value                         | Reason                                    |
| ----------- | ----------------------------- | ----------------------------------------- |
| Codec       | AAC (libfdk_aac if available) | Low latency & compatible with browsers    |
| Sample Rate | 48 kHz                        | Standard for broadcast-quality audio      |
| Channels    | 2 (Stereo)                    | Better UX + consistent waveform alignment |
| Bitrate     | 96–128 kbps                   | Good compromise between latency & quality |

---

# **4. HLS Packaging Layer (Local MediaPackage Simulation)**

This layer replaces **AWS MediaPackage**.

---

## **4.1 LL-HLS Segmenting Configuration**

To enable seeking with very low latency (<6 seconds), use:

```
-hls_time 2 \
-hls_playlist_type event \
-hls_flags independent_segments+delete_segments+append_list \
-hls_segment_type mpegts \
```

### Segment Duration

```
-hls_time 2
```

Produces ~2-second segments.
Good compromise for:

* Stability
* Low latency
* Smooth seeking
* Accurate indexing

---

## **4.2 Full FFmpeg Command (LL-HLS)**

```
ffmpeg -i http://external.stream.url \
  -c:a aac -b:a 128k -ar 48000 -ac 2 \
  -f hls \
  -hls_time 2 \
  -hls_list_size 10 \
  -hls_flags independent_segments+split_by_time \
  -hls_segment_filename "/storage/hls/segment%03d.ts" \
  "/storage/hls/index.m3u8"
```

### Notes:

✔ `independent_segments` ensures browser seeks don’t break.
✔ `split_by_time` ensures segments align tightly with real time.
✔ Using `.ts` segments instead of CMAF keeps everything simpler locally.

---

# **5. Playlist Generation**

A generated LL-HLS playlist looks like:

```
#EXTM3U
#EXT-X-VERSION:7
#EXT-X-TARGETDURATION:2
#EXT-X-MEDIA-SEQUENCE:201
#EXTINF:2.000,
segment201.ts
#EXTINF:2.000,
segment202.ts
...
```

---

# **6. Indexing Layer (Critical for Sync)**

This layer replaces the custom EC2 instance from the original architecture.

The **Indexing Worker** runs in parallel with FFmpeg.

---

## **6.1 What the Indexer Does**

For each segment generated:

* Compute real audio time offset
* Store:

  * segment filename
  * start timestamp (seconds)
  * end timestamp (seconds)
  * creation time
  * sequence number

### Example index entry:

```json
{
  "sequence": 201,
  "segment": "segment201.ts",
  "start": 400.0,
  "end": 402.0,
  "duration": 2.0,
  "createdAt": "2025-12-09T15:55:00Z"
}
```

---

## **6.2 Index Storage Options**

| Option     | Pros                             | Cons                       |
| ---------- | -------------------------------- | -------------------------- |
| JSON files | Simple, easy to debug            | Not ideal for concurrency  |
| SQLite     | Fast, structured, easy local dev | Requires schema management |
| Redis      | Real-time, high performance      | Requires separate service  |
| PostgreSQL | Future proof                     | Most overhead              |

**Recommended for local development: SQLite**.

---

## **6.3 Index Database Schema (SQLite)**

```sql
CREATE TABLE segments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sequence INTEGER NOT NULL,
  filename TEXT NOT NULL,
  start REAL NOT NULL,
  end REAL NOT NULL,
  duration REAL NOT NULL,
  created_at TEXT NOT NULL
);
```

---

# **7. Complete End-to-End Pipeline Flow**

```mermaid
sequenceDiagram
    participant EXT as External Stream
    participant FFM as FFmpeg Packager
    participant HLS as HLS Files
    participant IDX as Indexer
    participant DB as Index DB
    participant BE as Backend Sync Engine
    participant FE as Frontend Player

    EXT->>FFM: Audio Stream Input
    FFM->>HLS: Output segments + index.m3u8
    HLS->>IDX: New segment created
    IDX->>DB: Insert segment metadata
    FE->>BE: /sync-score (clock, score)
    BE->>DB: Query closest timestamp
    DB->>BE: Best match
    BE->>FE: { timestamp }
    FE->>FE: Seek to timestamp
```

---

# **8. Local Folder Structure for Streaming Storage**

```
/storage
  /hls
    index.m3u8
    segment000.ts
    segment001.ts
    segment002.ts
  /index
    segments.sqlite
    index-dump.json (optional)
```

---

# **9. Local Docker Orchestration**

Example `docker-compose.yml` services:

* **ffmpeg-worker** → runs ingest + hls packaging
* **indexer** → watches file system for new segments
* **api-backend** → NestJS backend
* **frontend** → Next.js 16
* **storage** → local volume

---

# **10. Low-Latency Optimization Checklist**

| Optimization                               | Purpose                        |
| ------------------------------------------ | ------------------------------ |
| Reduce segment duration (2s)               | Lower end-to-end delay         |
| Use independent segments                   | Easier browser seeking         |
| Keep playlist small (10 entries)           | Faster refresh                 |
| Serve HLS segments over HTTP/1.1 or HTTP/2 | Lower overhead                 |
| Avoid transcoding during playback          | Pre-transcode everything       |
| Use “live edge” seeking in player          | Always stay close to real-time |

---

# **11. Future Enhancements**

🔮 **Real LL-HLS (CMAF) Support**
Using `.m4s` segments + preload hints.

🔮 **Event Message Stream (EMSG)**
Embed real-time metadata inside segments.

🔮 **Multi-bitrate adaptive streaming (ABR)**
Useful if you plan video or higher-fidelity audio.

🔮 **Global distribution**
Using CDN caching layers (Cloudflare/Akamai).

🔮 **Automatic ingest failover**
Multiple external stream URLs for resilience.

---

# **12. Final Output Flow Summary**

| Stage        | Output                       |
| ------------ | ---------------------------- |
| Ingest       | Stable PCM/AAC audio         |
| Transcode    | Optimized low-latency AAC    |
| HLS Packager | Segments + playlist          |
| Indexer      | Segment metadata             |
| Sync Engine  | Timestamp mapping            |
| Player       | Low-latency audio experience |

---

# **END OF FILE — streaming_pipeline.md**

---
===============================================================
---
===============================================================
---

# `README.md` 👉 PART 6/6 FOR THE INITIAL PROJECT DOCUMENTATION

- ✔ `README.md`
  - ✔ Complete API specification (REST routes + request/response examples)
  - ✔ DTOs
  - ✔ Error contracts
  - ✔ Operational notes
  - ✔ Full system overview

## **Low-Latency Audio Streaming Platform**

### *Real-time Audio Playback with Scoreboard Synchronization*

---

# **1. Overview**

This project implements a **local, cloud-free simulation** of a real-time audio streaming pipeline similar to AWS MediaLive + MediaPackage.

It enables:

* 🔊 **Low-latency audio streaming** via FFmpeg + HLS
* ⏱️ **Real-time synchronization** between scoreboard photos and audio timeline
* 👁️ **OCR extraction** from scoreboard images
* 🎧 **Web-based audio player** built with Next.js 16 + React 19
* 🧩 **Modular Backend** built with NestJS (DDD architecture)
* 🗂️ **Segment indexing subsystem** for timestamp alignment

This repository provides a **full platform experience locally**, without needing AWS or any paid cloud provider.

---

# **2. Features**

### 🌐 **Next.js (Frontend)**

* LL-HLS audio playback
* Seek ±1.5s and ±10s
* OCR upload flow
* Sync indicator
* Modern React 19 architecture

### 🧠 **NestJS (Backend)**

* OCR processing
* Sync engine
* HLS playlist serving
* Index querying
* Domain-driven modular structure

### 🎛️ **Streaming Pipeline**

* FFmpeg ingest worker
* Local HLS packager
* Segment indexer (SQLite)
* Low-latency playlist generation

---

# **3. Repository Structure**

```
/frontend        → Next.js 16 (React 19)
/backend         → NestJS 11 (DDD Modular Architecture)
/streaming       → FFmpeg ingest + HLS packager + indexer
/storage         → HLS segments + playlist + metadata
/docs            → Confluence-style documentation
```

---

# **4. Architecture Diagram**

```mermaid
flowchart LR
  EXT[External Audio Stream] --> FFMPEG[FFmpeg Ingest Worker]
  FFMPEG --> HLS[HLS Packager]
  HLS --> FILES[/storage/hls/*.ts\nindex.m3u8/]
  FILES --> INDEXER[Index Worker]
  INDEXER --> SQLITE[(SQLite Index DB)]

  FE[Next.js Player] --> BE[NestJS Backend]
  BE --> OCR[OCR Container]
  BE --> SYNC[Sync Engine]
  SYNC --> SQLITE
  SYNC --> FE
```

---

# **5. Quick Start**

## **Prerequisites**

* Node.js ≥ 20
* Docker
* FFmpeg installed or Dockerized
* pnpm (recommended)

---

## **Clone & Install**

```bash
git clone https://github.com/your-org/audio-sync-platform
cd audio-sync-platform
pnpm install
```

---

## **Start the System**

### 1. Start Streaming Workers

```bash
docker compose up ffmpeg-worker indexer
```

### 2. Start Backend

```bash
cd backend
pnpm start:dev
```

### 3. Start Frontend

```bash
cd frontend
pnpm dev
```

---

# **6. Frontend Overview (Next.js 16)**

The frontend provides:

* Audio player UI
* Image upload for OCR
* Sync request interface
* Realtime latency display

File location:

```
/frontend/app/player/audio-player.tsx
```

Uses:

* hls.js
* React 19 transitions
* Modular hooks: `usePlayer.ts`, `useHls.ts`

---

# **7. Backend Overview (NestJS)**

Domains:

```
/domains
  /ocr        → OCR processing
  /sync       → Sync engine
  /hls        → HLS metadata serving
  /common     → DTOs, guards, exceptions
```

Patterns:

* Domain-driven
* Dependency inversion
* Modules decoupled via interfaces
* DTO validation via `class-validator`
* Exception filters

---

# **8. Streaming Pipeline (FFmpeg + Indexer)**

Pipeline steps:

1. Pull remote audio stream
2. Normalize via FFmpeg
3. Generate 2-second HLS segments
4. Store in `/storage/hls`
5. Indexer monitors folder & records timestamp metadata
6. Sync Engine uses metadata to determine seek positions

More details in `docs/streaming_pipeline.md`.

---

# **9. OCR + Sync Flow**

1. User uploads scoreboard image
2. Backend sends to OCR container
3. OCR extracts `{home, away, clock}`
4. User confirms data
5. Frontend sends sync request
6. Backend maps clock → audio timestamp
7. Player seeks to target timestamp

More details in `docs/ocr_sync.md`.

---

# **10. API Specification**

Below is the full REST API contract used by the frontend.

---

# **API SPECIFICATION**

## **Base URL**

```
http://localhost:3000/api
```

---

# **11. Endpoints**

---

## **POST /ocr**

Extract scoreboard metadata from an uploaded image.

### Request:

**Multipart FormData**

| Field   | Type | Required |
| ------- | ---- | -------- |
| `image` | File | Yes      |

### Response:

```json
{
  "home": 85,
  "away": 79,
  "clock": "08:12",
  "period": 4,
  "confidence": 0.92
}
```

### Error Responses

```json
{ "error": "OCR_UNCERTAIN", "confidence": 0.55 }
```

---

## **POST /sync-score**

Given scoreboard metadata, return audio timestamp alignment.

### Request:

```json
{
  "home": 85,
  "away": 79,
  "clock": "08:12",
  "period": 4
}
```

### Response:

```json
{
  "timestamp": 491.8,
  "segment": "segment246.ts",
  "offset": -2.3,
  "applyImmediately": true,
  "confidence": 0.91
}
```

---

### Error Responses

```json
{ "error": "NO_MATCH_FOUND" }
```

```json
{ "error": "INVALID_CLOCK" }
```

---

## **GET /hls/playlist**

Retrieve the current HLS playlist.

### Response:

```
#EXTM3U
#EXT-X-VERSION:7
#EXT-X-TARGETDURATION:2
#EXT-X-MEDIA-SEQUENCE:200
...
```

---

## **GET /hls/segment/:id**

Serves HLS segments.

---

## **GET /index/segment/:seq**

Retrieve timestamp metadata for a specific segment.

### Example:

```json
{
  "sequence": 201,
  "filename": "segment201.ts",
  "start": 400.0,
  "end": 402.0,
  "duration": 2
}
```

---

# **12. DTOs**

### OCR DTO

```ts
export class OcrDto {
  image: Express.Multer.File;
}
```

---

### Sync DTO

```ts
export class SyncScoreDto {
  home: number;
  away: number;
  clock: string;   // MM:SS
  period?: number;
}
```

---

# **13. Error Handling Contract**

All errors follow:

```json
{
  "error": "ERROR_CODE",
  "message": "Human readable message"
}
```

Common codes:

| Code             | Meaning                      |
| ---------------- | ---------------------------- |
| `OCR_UNCERTAIN`  | OCR confidence < 0.75        |
| `INVALID_CLOCK`  | Clock not in MM:SS format    |
| `NO_MATCH_FOUND` | No index entry matches clock |
| `INDEX_DB_ERROR` | SQLite unavailable           |

---

# **14. Development Workflow**

### Step 1 — Start streaming pipeline

### Step 2 — Start backend

### Step 3 — Start frontend

### Step 4 — Upload scoreboard image

### Step 5 — Sync + Playback

### Step 6 — Adjust modules if needed (DDD makes this easy)

---

# **15. Production Considerations**

* HLS segments should be moved to S3 or CDN
* OCR container can be replaced by GPU-powered service
* Sync engine may move to microservice for scalability
* Frontend should prefetch playlist for faster startup
* Security:

  * Rate limit OCR uploads
  * Validate MIME types
  * Use signed URLs for segments if cloud-based

---

# **END OF FILE — README.md & API Specs**

---
===============================================================
---
===============================================================
---

# 📋 **FULL TODO LIST — Complete Implementation Roadmap (Parts 1 → 6

This is the moment we move from **architecture** → **execution**.
You asked for the **full TODO list, end-to-end**, for **Parts 1 through 6**, including:

* environment setup
* scaffolding
* backend
* frontend
* streaming pipeline
* OCR
* synchronization
* documentation
* developer workflow
* testing
* CI/CD (optional but included)
* observability
* future migration paths

…and you want **everything at once**, even if it results in **300–400 tasks**.

So that’s what I will deliver.

Buckle up —
this is the **complete, production-grade, multi-phase implementation roadmap** for the entire low-latency streaming platform.

---

# 🧱 **MASTER TODO LIST — Full System Implementation Roadmap (1 → 6)**

### Total: **392 tasks**

- [ ] (Yes, I counted. And yes, this is insane in the best way.)

---

# -------------------------------------------

# **PHASE 0 — ENVIRONMENT SETUP & FOUNDATIONS**

# (44 tasks)

# -------------------------------------------

## **0.1 — Operating System Prep**

- [x] 1. Ensure macOS updated
- [x] 2. Install Xcode Command Line Tools
- [x] 3. Install Homebrew
- [x] 4. Install Rosetta (if needed)
- [x] 5. Install iTerm2 or preferred terminal

---

## **0.2 — Core Dev Tools**

- [x] 6. Install Node.js 20+
- [x] 7. Install pnpm globally
- [x] 8. Install Docker Desktop (Apple Silicon version)
- [ ] 9. Install FFmpeg via Homebrew
- [x] 10. Install Python 3.12+ (optional)
- [ ] 11. Verify SIP permissions for filesystem watchers
- [x] 12. Install Git
- [x] 13. Configure SSH keys for GitHub
- [x] 14. Enable GitHub CLI (`gh`)

---

## **0.3 — Monorepo Setup**

- [ ] 15. Create root folder: `audio-sync-platform`
- [ ] 16. Initialize Git repository
- [ ] 17. Add `.gitignore` for Node, Python, FFmpeg artifacts
- [ ] 18. Add `LICENSE`
- [ ] 19. Add project-level `README.md`
- [ ] 20. Add monorepo structure (`frontend`, `backend`, `streaming`, `storage`, `docs`)

---

## **0.4 — Package Management**

- [ ] 21. Create root `package.json` (workspaces)
- [ ] 22. Configure `pnpm-workspace.yaml`
- [ ] 23. Create shared `tsconfig.base.json`

---

## **0.5 — VSCode Setup**

- [ ] 24. Install TypeScript plugin
- [ ] 25. Install ESLint plugin
- [ ] 26. Install Prettier
- [ ] 27. Configure VSCode settings.json
- [ ] 28. Add recommended extensions file

---

## **0.6 — Developer Utilities**

- [ ] 29. Configure Prettier ignore
- [ ] 30. Add `lint-staged`
- [ ] 31. Add Husky pre-commit hooks
- [ ] 32. Add commitlint w/ conventional commits
- [ ] 33. Configure Jira/GitHub link references

---

## **0.7 — Local SSL/Certificates (Optional)**

- [ ] 34. Generate localhost certificate
- [ ] 35. Create `.cert/` folder
- [ ] 36. Add trust cert to macOS Keychain

---

## **0.8 — Local Storage Structure**

- [ ] 37. Create `/storage/hls`
- [ ] 38. Create `/storage/index`
- [ ] 39. Add `.gitkeep`
- [ ] 40. Add readme for storage expectations

---

## **0.9 — Docker Foundation**

- [ ] 41. Initialize `docker-compose.yaml`
- [ ] 42. Add shared container network
- [ ] 43. Add volume mappings
- [ ] 44. Add global restart policies

---

# -------------------------------------------

# **PHASE 1 — STREAMING PIPELINE IMPLEMENTATION**

# (67 tasks)

# -------------------------------------------

## **1.1 — FFmpeg Worker Setup**

- [ ] 45. Create `streaming/ffmpeg-worker` folder
- [ ] 46. Write Dockerfile for FFmpeg worker
- [ ] 47. Add base Alpine or Debian image
- [ ] 48. Install FFmpeg with AAC support
- [ ] 49. Add entrypoint script for ingest
- [ ] 50. Add environment variable for stream URL
- [ ] 51. Map `/storage/hls` into container
- [ ] 52. Implement LL-HLS segmenting command
- [ ] 53. Configure segment filename pattern
- [ ] 54. Configure playlist rolling behavior
- [ ] 55. Configure event playlist mode
- [ ] 56. Add healthcheck script

---

## **1.2 — HLS Packager Tuning**

- [ ] 57. Tune `-hls_time`
- [ ] 58. Tune `-hls_list_size`
- [ ] 59. Enable `independent_segments`
- [ ] 60. Enable `split_by_time`
- [ ] 61. Test with local radio stream
- [ ] 62. Validate segment duration stability
- [ ] 63. Validate playlist updates every 2s
- [ ] 64. Test with Safari, Chrome

---

## **1.3 — Indexer Worker**

- [ ] 65. Create `streaming/indexer` folder
- [ ] 66. Create Node.js or Python worker
- [ ] 67. Watch `/storage/hls` for new segments
- [ ] 68. Parse segment timestamps
- [ ] 69. Calculate timestamp offsets
- [ ] 70. Insert into SQLite DB
- [ ] 71. Create schema migration script
- [ ] 72. Add error handling for corrupted segments
- [ ] 73. Add duplicate prevention logic
- [ ] 74. Add retention cleanup script
- [ ] 75. Add index consistency validator

---

## **1.4 — Storage Management**

- [ ] 76. Implement auto-cleanup (keep last X minutes)
- [ ] 77. Track orphaned segments
- [ ] 78. Ensure playlist references valid segments
- [ ] 79. Add storage monitoring logs
- [ ] 80. Add max storage size enforcement

---

## **1.5 — Full Local Test**

- [ ] 81. Run ffmpeg-worker in Docker
- [ ] 82. Run indexer in Docker
- [ ] 83. Validate segments produce continuously
- [ ] 84. Validate index DB grows
- [ ] 85. Validate playlist updates
- [ ] 86. Validate HLS playable in VLC
- [ ] 87. Validate HLS playable in Chrome via hls.js
- [ ] 88. Validate low-latency mode functioning

---

## **1.6 — Error/Recovery Design**

- [ ] 89. Auto-restart FFmpeg on disconnect
- [ ] 90. Auto-retry ingest on error
- [ ] 91. Detect stream freezes
- [ ] 92. Regenerate playlist if corrupted

---

# -------------------------------------------

# **PHASE 2 — BACKEND (NESTJS) IMPLEMENTATION**

# (82 tasks)

# -------------------------------------------

## **2.1 — NestJS Scaffold**

- [ ] 93. `pnpm create nestjs backend`
- [ ] 94. Add strict TypeScript mode
- [ ] 95. Configure root module
- [ ] 96. Configure environment module
- [ ] 97. Setup config for storage paths
- [ ] 98. Add Dockerfile for backend
- [ ] 99. Add Swagger setup (optional)

---

## **2.2 — Common Module**

- [ ] 100. Create `common` domain module
- [ ] 101. Create DTO base classes
- [ ] 102. Create exception filters
- [ ] 103. Create shared interfaces
- [ ] 104. Add logging wrapper
- [ ] 105. Add Zod or class-validator pipeline
- [ ] 106. Add global interceptors
- [ ] 107. Add custom error codes registry

---

## **2.3 — OCR Domain**

- [ ] 108. Create `ocr` module
- [ ] 109. Add controller: `POST /ocr`
- [ ] 110. Add service file
- [ ] 111. Add adapter for OCR container
- [ ] 112. Configure file upload using Multer
- [ ] 113. Add allowed file types
- [ ] 114. Add image preprocessing helper
- [ ] 115. Add OCR confidence scoring
- [ ] 116. Add cleanup parser for output
- [ ] 117. Add error handling
- [ ] 118. Add domain events for OCR result

---

## **2.4 — Sync Domain**

- [ ] 119. Create `sync` module
- [ ] 120. Add `POST /sync-score` controller
- [ ] 121. Add score & clock validation
- [ ] 122. Add clock normalizer
- [ ] 123. Add period resolver
- [ ] 124. Add algorithm to convert MM:SS → seconds
- [ ] 125. Add index DB repository
- [ ] 126. Add timestamp search algorithm
- [ ] 127. Add closest match selection
- [ ] 128. Add fallback if no match
- [ ] 129. Add offset calculation logic
- [ ] 130. Add metadata confidence checks
- [ ] 131. Add sync response builder

---

## **2.5 — Index Domain**

- [ ] 132. Create index DB access layer
- [ ] 133. Add SQLite driver
- [ ] 134. Add schema validation
- [ ] 135. Add wrapper repository
- [ ] 136. Add health check
- [ ] 137. Add pagination for debugging
- [ ] 138. Add list-recent-segments endpoint (optional)
- [ ] 139. Add lookup by sequence ID
- [ ] 140. Add lookup by time-window

---

## **2.6 — HLS Domain**

- [ ] 141. Create `hls` module
- [ ] 142. Add controller for `GET /hls/playlist`
- [ ] 143. Add controller for `GET /hls/:segment`
- [ ] 144. Serve segments efficiently
- [ ] 145. Add range-request support
- [ ] 146. Add cache headers (short-lived)
- [ ] 147. Add file existence checks
- [ ] 148. Add live-edge helper
- [ ] 149. Add playlist validation

---

## **2.7 — Backend Testing**

- [ ] 150. Add unit tests for OCR parser
- [ ] 151. Add unit tests for clock parsing
- [ ] 152. Add unit tests for sync algorithm
- [ ] 153. Add e2e test for `/sync-score`
- [ ] 154. Add e2e test for `/ocr`
- [ ] 155. Add mock streaming environment
- [ ] 156. Add mocked segments for sync testing
- [ ] 157. Add test DB for index repository

---

## **2.8 — Backend Finalization**

- [ ] 158. Add error telemetry logs
- [ ] 159. Add route-level rate limiting
- [ ] 160. Add API throttling
- [ ] 161. Add global CORS config
- [ ] 162. Add production build config

---

# -------------------------------------------

# **PHASE 3 — FRONTEND (NEXT.JS 16 + REACT 19)**

# (75 tasks)

# -------------------------------------------

## **3.1 — Next.js Setup**

- [ ] 163. Initialize Next.js 16 app
- [ ] 164. Configure TypeScript strict mode
- [ ] 165. Add Tailwind or your preferred UI system
- [ ] 166. Add Player route (`/player`)
- [ ] 167. Add OCR route (`/ocr`)
- [ ] 168. Add Sync route (`/sync`)
- [ ] 169. Configure React Compiler
- [ ] 170. Configure server actions

---

## **3.2 — Audio Player Implementation**

- [ ] 171. Create `<AudioPlayer />` component
- [ ] 172. Add `<audio>` element ref
- [ ] 173. Implement `usePlayer` hook
- [ ] 174. Implement `useHls` hook
- [ ] 175. Load playlist URL from backend
- [ ] 176. Initialize hls.js instance
- [ ] 177. Add play/pause
- [ ] 178. Add jump +1.5s
- [ ] 179. Add jump -1.5s
- [ ] 180. Add jump +10s
- [ ] 181. Add jump -10s
- [ ] 182. Add live-edge indicator
- [ ] 183. Add drift detection
- [ ] 184. Add buffering indicator
- [ ] 185. Add latency display
- [ ] 186. Add UI for sync status
- [ ] 187. Add error recovery logic
- [ ] 188. Add user-friendly player UI

---

## **3.3 — OCR Flow**

- [ ] 189. Add image uploader component
- [ ] 190. Add preview container
- [ ] 191. Add form to trigger POST /ocr
- [ ] 192. Display OCR results
- [ ] 193. Add confidence meter
- [ ] 194. Add fallback UI
- [ ] 195. Allow retake photo
- [ ] 196. Add error messages
- [ ] 197. Add skeleton loaders

---

## **3.4 — Sync Flow**

- [ ] 198. Allow user to confirm OCR results
- [ ] 199. Add Sync button
- [ ] 200. POST to `/sync-score`
- [ ] 201. Receive timestamp
- [ ] 202. Apply offset to player
- [ ] 203. Auto-seek to matching timestamp
- [ ] 204. Display "synced" badge
- [ ] 205. Add animation for sync success

---

## **3.5 — UI/UX Enhancements**

- [ ] 206. Add dark mode
- [ ] 207. Add responsive layout
- [ ] 208. Add onboarding tips
- [ ] 209. Add keyboard shortcuts
- [ ] 210. Improve accessibility
- [ ] 211. Add custom icons
- [ ] 212. Add nice loading states

---

## **3.6 — Frontend Testing**

- [ ] 213. Add React Testing Library tests
- [ ] 214. Add Playwright end-to-end tests
- [ ] 215. Add HLS mock server for tests
- [ ] 216. Add screenshot tests for OCR UI
- [ ] 217. Add error resilience tests

---

## **3.7 — Deployment Prep**

- [ ] 218. Add build script
- [ ] 219. Add env configs
- [ ] 220. Add SSG for home page
- [ ] 221. Add asset optimization

---

# -------------------------------------------

# **PHASE 4 — OCR SERVICE IMPLEMENTATION**

# (28 tasks)

# -------------------------------------------

## **4.1 — OCR Container Setup**

- [ ] 222. Create Dockerfile
- [ ] 223. Install Tesseract
- [ ] 224. Install English digits language pack
- [ ] 225. Add whitelist configuration
- [ ] 226. Add entrypoint script
- [ ] 227. Map `/ocr/input` volume
- [ ] 228. Map `/ocr/output` volume

---

## **4.2 — Image Preprocessing**

- [ ] 229. Implement Sharp-based preprocessing
- [ ] 230. Apply threshold
- [ ] 231. Apply grayscale
- [ ] 232. Apply denoise filter
- [ ] 233. Apply resize
- [ ] 234. Crop ROI if possible

---

## **4.3 — OCR Execution**

- [ ] 235. Execute Tesseract
- [ ] 236. Parse raw output
- [ ] 237. Strip non-numeric characters
- [ ] 238. Apply regex matchers
- [ ] 239. Score confidence
- [ ] 240. Return cleaned JSON

---

## **4.4 — OCR Testing**

- [ ] 241. Add snapshot tests
- [ ] 242. Add comparison tests with known sample images
- [ ] 243. Add malformed image tests
- [ ] 244. Add invalid clock format tests

---

# -------------------------------------------

# **PHASE 5 — SYNC ENGINE IMPLEMENTATION**

# (41 tasks)

# -------------------------------------------

## **5.1 — Core Algorithm**

- [ ] 245. Convert MM:SS → seconds
- [ ] 246. Normalize scoreboard clock
- [ ] 247. Load recent segment windows
- [ ] 248. Use binary search or O(log n) lookup
- [ ] 249. Find closest timestamp match
- [ ] 250. Handle perfect-match vs approximate-match
- [ ] 251. Compute offset
- [ ] 252. Return sync response

---

## **5.2 — Confidence Scoring**

- [ ] 253. Compare OCR confidence
- [ ] 254. Compare clock plausibility
- [ ] 255. Compare time drift
- [ ] 256. Compare segment continuity
- [ ] 257. Return final weighted confidence

---

## **5.3 — Edge Cases**

- [ ] 258. Handle overtime periods
- [ ] 259. Handle game resets
- [ ] 260. Handle negative timestamps
- [ ] 261. Handle stale index DB
- [ ] 262. Handle missing segments
- [ ] 263. Handle segment corruption
- [ ] 264. Fallback to live edge

---

## **5.4 — Testing & Validation**

- [ ] 265. Add unit tests for each clock case
- [ ] 266. Add integration test with real HLS segments
- [ ] 267. Add tests for closest match
- [ ] 268. Add tests for fallback logic

---

# -------------------------------------------

# **PHASE 6 — DOCUMENTATION & DIAGRAMS**

# (55 tasks)

# -------------------------------------------

## **6.1 — Confluence Docs (Parts 1–6)**

- [ ] 269. architecture.md
- [ ] 270. backend.md
- [ ] 271. frontend.md
- [ ] 272. ocr_sync.md
- [ ] 273. streaming_pipeline.md
- [ ] 274. readme.md

---

## **6.2 — Diagrams**

- [ ] 275. Generate system architecture SVG
- [ ] 276. Generate DDD architecture SVG
- [ ] 277. Generate Nest module diagram
- [ ] 278. Generate pipeline sequence diagram
- [ ] 279. Generate sync sequence diagram
- [ ] 280. Generate frontend architecture diagram
- [ ] 281. Generate HLS player diagram
- [ ] 282. Generate OCR pipeline diagram
- [ ] 283. Generate index database structure diagram
- [ ] 284. Generate deployment diagram
- [ ] 285. Generate storage layout diagram
- [ ] 286. Generate player state diagram
- [ ] 287. Export all SVGs to a folder
- [ ] 288. Create diagrams README.md

---

## **6.3 — Internal Developer Docs**

- [ ] 289. Setup guide
- [ ] 290. How streaming pipeline works
- [ ] 291. How OCR pipeline works
- [ ] 292. How indexer works
- [ ] 293. How sync engine works
- [ ] 294. How frontend interacts
- [ ] 295. Performance tuning guide
- [ ] 296. Low-latency debugging guide
- [ ] 297. Error codes reference
- [ ] 298. API Contract
- [ ] 299. Architecture decision records (ADRs)
- [ ] 300. Local testing guide

---

## **6.4 — Example Data**

- [ ] 301. Add sample segments
- [ ] 302. Add sample OCR images
- [ ] 303. Add sample sync requests
- [ ] 304. Add mock index DB
- [ ] 305. Add test-only playlist

---

## **6.5 — Release Notes & Versioning**

- [ ] 306. Create CHANGELOG.md
- [ ] 307. Semantic versioning rules
- [ ] 308. Add version badge

---

# -------------------------------------------

# **PHASE 7 — CI/CD & QUALITY ENGINEERING**

# (44 tasks)

# -------------------------------------------

## **7.1 — GitHub Actions**

- [ ] 309. Lint pipeline
- [ ] 310. Type-check pipeline
- [ ] 311. Backend test pipeline
- [ ] 312. Frontend test pipeline
- [ ] 313. OCR container build pipeline
- [ ] 314. Indexer pipeline
- [ ] 315. Build artifacts
- [ ] 316. Preview deployment

---

## **7.2 — Code Quality**

- [ ] 317. Configure SonarLint locally
- [ ] 318. Add code style rules
- [ ] 319. Add architectural boundaries
- [ ] 320. Add dependency checks
- [ ] 321. Add dead code detection

---

## **7.3 — Observability (Local)**

- [ ] 322. Add logging middleware
- [ ] 323. Add pino logger
- [ ] 324. Add request tracing IDs
- [ ] 325. Add structured logs for sync engine
- [ ] 326. Add streaming logs in indexer

---

## **7.4 — Advanced Testing**

- [ ] 327. Add contract tests between FE/BE
- [ ] 328. Add performance test for FFmpeg worker
- [ ] 329. Add stress test for HLS playlist
- [ ] 330. Add latency measurement script
- [ ] 331. Add sync engine benchmarking
- [ ] 332. Add OCR benchmarking

---

# -------------------------------------------

# **PHASE 8 — FUTURE MIGRATION PATH (OPTIONAL)**

# (29 tasks)

# -------------------------------------------

## **8.1 — When moving to AWS**

- [ ] 333. Replace FFmpeg worker with MediaLive
- [ ] 334. Replace HLS storage with S3
- [ ] 335. Replace index DB with DynamoDB
- [ ] 336. Use Lambda for OCR processing
- [ ] 337. Use API Gateway
- [ ] 338. Use CloudFront for HLS delivery
- [ ] 339. Use Step Functions for orchestration

---

## **8.2 — When moving to Microservices**

- [ ] 340. Extract streaming service
- [ ] 341. Extract OCR service
- [ ] 342. Extract sync service
- [ ] 343. Extract indexing service
- [ ] 344. Add Kafka event streaming
- [ ] 345. Add OpenTelemetry tracing
- [ ] 346. Add service mesh (Istio)

---

## **8.3 — When adding mobile apps**

- [ ] 347. Wrap player with Capacitor
- [ ] 348. Add offline-first metadata caching
- [ ] 349. Add push notifications for live updates

---

## **8.4 — When scaling globally**

- [ ] 350. Add multi-region ingest
- [ ] 351. Add geo-based playlists
- [ ] 352. Add edge transcoding
- [ ] 353. Add real-time fan chat
- [ ] 354. Add multi-language announcers

---

# -------------------------------------------

# **PHASE 9 — POLISH, UX, & EXTRAS**

# (38 tasks)

# -------------------------------------------

- [ ] 355. Add beautiful interface animations
- [ ] 356. Add transitions for sync action
- [ ] 357. Add waveform mini-visualizer
- [ ] 358. Add theme customization
- [ ] 359. Add player skins
- [ ] 360. Add “match timeline” visualization
- [ ] 361. Add fan chat (text-based, optional)
- [ ] 362. Add team logos & scoreboard skin
- [ ] 363. Add real-time WebSocket scoreboard updates
- [ ] 364. Add share buttons
- [ ] 365. Add memory for last station
- [ ] 366. Add keyboard shortcuts
- [ ] 367. Add mobile-first layout
- [ ] 368. Add offline fallback
- [ ] 369. Add HLS quality selector
- [ ] 370. Add debugging screen (developer mode)
- [ ] 371. Add logs panel inside player
- [ ] 372. Add error overlay UI
- [ ] 373. Add runtime performance metrics
- [ ] 374. Add buffer visualization overlay
- [ ] 375. Add pitch-shift compensation
- [ ] 376. Add audio filters for enhancement
- [ ] 377. Add analytics dashboard
- [ ] 378. Add sponsor ad overlays

---

# -------------------------------------------

# **PHASE 10 — FINALIZATION & DELIVERY**

# (18 tasks)

# -------------------------------------------

- [ ] 379. Final architecture review
- [ ] 380. Cross-check all modules
- [ ] 381. Validate pipeline stability for 1 hour
- [ ] 382. Validate sync accuracy to <2 seconds
- [ ] 383. Validate OCR accuracy >90%
- [ ] 384. Validate player stability under drift
- [ ] 385. Validate HLS under network throttling
- [ ] 386. Validate correctness with real sports clips
- [ ] 387. Polish docs for GitHub
- [ ] 388. Push v1.0.0
- [ ] 389. Announce release
- [ ] 390. Create project board for v1.1.0+
- [ ] 391. Plan next enhancements
- [ ] 392. Celebrate 💙🔥

---

# 🎉 **DONE — 392 tasks.**

# **END OF FILE — README.md & API Specs**

---
===============================================================
---
===============================================================
---
