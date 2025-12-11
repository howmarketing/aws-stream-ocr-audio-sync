# Audio Sync Platform - API Documentation

## Base URL

```
Development: http://localhost:4000/api
Production: https://your-domain.com/api
```

## Authentication

Currently, the API does not require authentication. For production deployments, implement JWT-based authentication.

---

## Health Check

### Get System Health

```http
GET /health
```

Returns the system health status.

**Response 200 (OK)**
```json
{
  "status": "ok",
  "timestamp": "2025-12-11T10:30:00.000Z",
  "service": "audio-sync-backend",
  "version": "1.0.0"
}
```

---

## HLS Endpoints

### Get HLS Playlist

```http
GET /hls/playlist
```

Returns the HLS M3U8 playlist file for audio streaming.

**Response 200 (OK)**
```m3u8
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:2
#EXT-X-MEDIA-SEQUENCE:1234
#EXTINF:2.000000,
segment1234.ts
#EXTINF:2.000000,
segment1235.ts
...
```

**Headers**
- `Content-Type: application/vnd.apple.mpegurl`
- `Access-Control-Allow-Origin: http://localhost:3030`

---

### Get HLS Segment

```http
GET /hls/:filename
```

Returns a specific MPEG-TS segment file.

**Path Parameters**
- `filename` (string, required): Segment filename (e.g., `segment1234.ts`)

**Response 200 (OK)**
- Binary MPEG-TS data (~256KB)

**Headers**
- `Content-Type: video/mp2t`
- `Content-Length: 262144`

**Response 404 (Not Found)**
```json
{
  "statusCode": 404,
  "message": "Segment not found"
}
```

---

### Get Stream Info

```http
GET /hls/info
```

Returns metadata about the current HLS stream.

**Response 200 (OK)**
```json
{
  "streamActive": true,
  "currentSequence": 1234,
  "segmentCount": 10,
  "segmentDuration": 2,
  "totalDuration": 2468
}
```

---

## Index Endpoints

### Get All Segments

```http
GET /index/segments
```

Returns list of all indexed segments with timestamps.

**Query Parameters**
- `limit` (number, optional): Maximum number of segments to return (default: 100)
- `offset` (number, optional): Pagination offset (default: 0)

**Response 200 (OK)**
```json
{
  "segments": [
    {
      "filename": "segment1234.ts",
      "sequence": 1234,
      "start": 2468.0,
      "end": 2470.0,
      "duration": 2.0,
      "createdAt": 1702304400000
    },
    ...
  ],
  "total": 1234,
  "limit": 100,
  "offset": 0
}
```

---

### Get Segment by Sequence

```http
GET /index/segments/:sequence
```

Returns a specific segment by its sequence number.

**Path Parameters**
- `sequence` (number, required): Segment sequence number

**Response 200 (OK)**
```json
{
  "filename": "segment1234.ts",
  "sequence": 1234,
  "start": 2468.0,
  "end": 2470.0,
  "duration": 2.0,
  "createdAt": 1702304400000
}
```

**Response 404 (Not Found)**
```json
{
  "statusCode": 404,
  "message": "Segment not found"
}
```

---

### Find Segment by Time

```http
GET /index/find-by-time?timestamp=245.6
```

Finds the segment containing a specific timestamp.

**Query Parameters**
- `timestamp` (number, required): Time in seconds

**Response 200 (OK)**
```json
{
  "filename": "segment123.ts",
  "sequence": 123,
  "start": 244.0,
  "end": 246.0,
  "duration": 2.0,
  "offset": 1.6
}
```

**Response 404 (Not Found)**
```json
{
  "statusCode": 404,
  "message": "No segment found for timestamp"
}
```

---

### Get Index Statistics

```http
GET /index/stats
```

Returns statistics about the segment index.

**Response 200 (OK)**
```json
{
  "totalSegments": 1234,
  "oldestSegment": {
    "sequence": 1,
    "start": 0.0,
    "createdAt": 1702300000000
  },
  "newestSegment": {
    "sequence": 1234,
    "start": 2468.0,
    "createdAt": 1702304400000
  },
  "totalDuration": 2468.0,
  "averageSegmentDuration": 2.0
}
```

---

## OCR Endpoints

### Upload and Process Image

```http
POST /ocr/upload
```

Uploads a scoreboard screenshot and extracts clock and score using OCR.

**Request**
- Content-Type: `multipart/form-data`
- Body: Form data with `image` field

**Request Example (curl)**
```bash
curl -X POST http://localhost:4000/api/ocr/upload \
  -F "image=@scoreboard.jpg"
```

**Request Example (JavaScript)**
```javascript
const formData = new FormData();
formData.append('image', file);

const response = await fetch('http://localhost:4000/api/ocr/upload', {
  method: 'POST',
  body: formData
});

const data = await response.json();
```

**Response 200 (OK)**
```json
{
  "success": true,
  "result": {
    "clock": "12:34",
    "score": {
      "home": 21,
      "away": 17
    },
    "confidence": 0.89,
    "rawText": "12:34 21-17 Quarter 3",
    "metadata": {
      "processingTime": 1823,
      "imageWidth": 1920,
      "imageHeight": 1080,
      "preprocessed": true
    }
  }
}
```

**Response 400 (Bad Request)**
```json
{
  "statusCode": 400,
  "message": "Invalid file type. Only JPEG and PNG are supported"
}
```

**Response 422 (Unprocessable Entity)**
```json
{
  "statusCode": 422,
  "message": "OCR processing failed",
  "error": {
    "reason": "No clock detected",
    "rawText": "Unable to extract meaningful text"
  }
}
```

---

### OCR Health Check

```http
POST /ocr/health
```

Checks if the OCR service is available and functioning.

**Response 200 (OK)**
```json
{
  "status": "healthy",
  "ocrServiceUrl": "http://ocr:3001",
  "tesseractVersion": "5.3.0"
}
```

**Response 503 (Service Unavailable)**
```json
{
  "status": "unhealthy",
  "message": "OCR service not responding"
}
```

---

## Sync Endpoints

### Synchronize to Clock Time

```http
POST /sync
```

Matches a game clock time to an audio timestamp and returns playback position.

**Request Body**
```json
{
  "clock": "12:34",
  "score": {
    "home": 21,
    "away": 17
  },
  "ocrConfidence": 0.89
}
```

**Request Fields**
- `clock` (string, required): Game clock in MM:SS format
- `score` (object, optional): Game score for validation
  - `home` (number): Home team score
  - `away` (number): Away team score
- `ocrConfidence` (number, optional): OCR confidence score (0.0-1.0)

**Response 200 (OK)**
```json
{
  "success": true,
  "timestamp": 245.6,
  "segmentFilename": "segment123.ts",
  "segmentSequence": 123,
  "confidence": 0.91,
  "drift": 0.4,
  "metadata": {
    "clockInput": "12:34",
    "clockSeconds": 754,
    "searchedSegments": 1234,
    "matchType": "exact"
  }
}
```

**Response 400 (Bad Request)**
```json
{
  "success": false,
  "error": "Invalid clock format. Expected MM:SS or M:SS",
  "providedClock": "99:99"
}
```

**Response 404 (Not Found)**
```json
{
  "success": false,
  "error": "No matching timestamp found",
  "metadata": {
    "clockInput": "45:00",
    "clockSeconds": 2700,
    "availableRange": "0s - 2468s"
  }
}
```

**Response 422 (Unprocessable Entity)**
```json
{
  "success": false,
  "error": "Confidence too low for sync",
  "confidence": 0.35,
  "threshold": 0.50,
  "metadata": {
    "factors": {
      "ocr": 0.30,
      "plausibility": 0.50,
      "drift": 0.20,
      "continuity": 0.50
    }
  }
}
```

---

### Jump to Live Edge

```http
POST /sync/live-edge
```

Returns the timestamp for the most recent segment (live edge).

**Response 200 (OK)**
```json
{
  "success": true,
  "timestamp": 2468.0,
  "segmentFilename": "segment1234.ts",
  "segmentSequence": 1234,
  "isLive": true
}
```

---

### Sync Health Check

```http
POST /sync/health
```

Checks if sync services are functional.

**Response 200 (OK)**
```json
{
  "status": "healthy",
  "services": {
    "clockNormalizer": "ok",
    "timestampSearcher": "ok",
    "confidenceCalculator": "ok"
  },
  "indexAvailable": true,
  "segmentCount": 1234
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Human-readable error message",
  "error": "BadRequest",
  "timestamp": "2025-12-11T10:30:00.000Z",
  "path": "/api/sync"
}
```

### Common Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 400 | Bad Request | Invalid request parameters |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Valid request but unable to process |
| 500 | Internal Server Error | Server error occurred |
| 503 | Service Unavailable | Dependent service unavailable |

---

## Rate Limiting

Currently, no rate limiting is implemented. For production:
- Recommended: 10 requests per second per IP
- OCR endpoint: 1 request per 2 seconds per IP
- Implement using `@nestjs/throttler`

---

## CORS Configuration

Current CORS settings (development):
```javascript
{
  origin: 'http://localhost:3030',
  credentials: true
}
```

Production recommendations:
```javascript
{
  origin: ['https://your-domain.com'],
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

---

## Webhook Support (Future)

Planned webhook events:
- `segment.created`: New segment indexed
- `ocr.completed`: OCR processing finished
- `sync.completed`: Sync request successful

---

## SDK Examples

### JavaScript/TypeScript

```typescript
// OCR Upload and Sync Example
async function syncToScoreboard(imageFile: File) {
  // 1. Upload image for OCR
  const formData = new FormData();
  formData.append('image', imageFile);

  const ocrResponse = await fetch('http://localhost:4000/api/ocr/upload', {
    method: 'POST',
    body: formData
  });

  const ocrData = await ocrResponse.json();

  if (!ocrData.success) {
    throw new Error('OCR failed');
  }

  // 2. Sync to detected clock time
  const syncResponse = await fetch('http://localhost:4000/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clock: ocrData.result.clock,
      score: ocrData.result.score,
      ocrConfidence: ocrData.result.confidence
    })
  });

  const syncData = await syncResponse.json();

  if (!syncData.success) {
    throw new Error('Sync failed');
  }

  // 3. Seek audio player
  audioElement.currentTime = syncData.timestamp;

  return {
    clock: ocrData.result.clock,
    timestamp: syncData.timestamp,
    confidence: syncData.confidence
  };
}
```

### cURL Examples

```bash
# Get HLS playlist
curl http://localhost:4000/api/hls/playlist

# Upload scoreboard for OCR
curl -X POST http://localhost:4000/api/ocr/upload \
  -F "image=@scoreboard.jpg"

# Sync to clock time
curl -X POST http://localhost:4000/api/sync \
  -H "Content-Type: application/json" \
  -d '{"clock":"12:34","ocrConfidence":0.89}'

# Get segment by timestamp
curl "http://localhost:4000/api/index/find-by-time?timestamp=245.6"

# Jump to live edge
curl -X POST http://localhost:4000/api/sync/live-edge
```

---

## Changelog

### v1.0.0 (December 11, 2025)
- Initial API release
- HLS streaming endpoints
- OCR upload and processing
- Sync clock-to-timestamp matching
- Segment index queries

---

## Support

For API issues or questions:
- GitHub Issues: https://github.com/your-repo/audio-sync-platform/issues
- Documentation: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- User Guide: See [USER-GUIDE.md](./USER-GUIDE.md)

---

**Version**: 1.0.0
**Last Updated**: December 11, 2025
**API Base URL**: http://localhost:4000/api